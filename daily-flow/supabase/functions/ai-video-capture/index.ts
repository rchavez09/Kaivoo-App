import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TopicContext {
  id: string;
  name: string;
  pages?: { id: string; name: string }[];
}

interface TagContext {
  id: string;
  name: string;
}

interface RequestBody {
  url: string;
  instruction?: string;
  transcript?: string;
  audioBase64?: string;
  topics: TopicContext[];
  tags: TagContext[];
  currentDate: string;
}

interface TranscriptSegment {
  text: string;
  start?: number;
  duration?: number;
}

// Detect video platform from URL
function detectPlatform(url: string): 'youtube' | 'tiktok' | 'vimeo' | 'instagram' | 'twitter' | 'unknown' {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'youtube';
  }
  if (lowerUrl.includes('tiktok.com') || lowerUrl.includes('vm.tiktok.com')) {
    return 'tiktok';
  }
  if (lowerUrl.includes('vimeo.com')) {
    return 'vimeo';
  }
  if (lowerUrl.includes('instagram.com') || lowerUrl.includes('instagr.am')) {
    return 'instagram';
  }
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
    return 'twitter';
  }
  return 'unknown';
}

// Extract YouTube video ID from various URL formats
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Extract audio URL using Cobalt API (works for YouTube, TikTok, Vimeo, Instagram, Twitter, etc.)
async function extractAudioWithCobalt(
  videoUrl: string,
  opts?: { platform?: 'youtube' | 'tiktok' | 'vimeo' | 'instagram' | 'twitter' | 'unknown' },
): Promise<{ audioUrl: string; filename?: string; cobaltStatus?: string } | null> {
  const COBALT_API_URL = Deno.env.get('COBALT_API_URL')?.trim();

  if (!COBALT_API_URL) {
    console.log('COBALT_API_URL not configured - audio extraction disabled');
    return null;
  }

  // Clean up the base URL
  const baseUrl = COBALT_API_URL.replace(/\/$/, '');

  // Build candidate endpoints - try root first (v10+), then /api/json (older versions)
  const candidateEndpoints: { url: string; version: 'v10' | 'legacy' }[] = [];

  if (baseUrl.includes('/api/')) {
    candidateEndpoints.push({ url: baseUrl, version: 'legacy' });
  } else {
    candidateEndpoints.push({ url: baseUrl, version: 'v10' });
    candidateEndpoints.push({ url: `${baseUrl}/api/json`, version: 'legacy' });
  }

  console.log('Extracting audio with Cobalt API...');

  let lastErrorText = '';

  // Inner helper to call Cobalt with specific alwaysProxy flag
  const callCobalt = async (endpoint: string, version: 'v10' | 'legacy', alwaysProxy: boolean) => {
    const isYouTube = opts?.platform === 'youtube';
    const requestBody =
      version === 'v10'
        ? {
            url: videoUrl,
            downloadMode: 'audio',
            audioFormat: 'mp3',
            // Force Cobalt to use its download proxy when available (avoids /tunnel 0-byte issues in edge runtimes)
            ...(alwaysProxy ? { alwaysProxy: true } : {}),
            // youtubeHLS uses HLS which is more stable server-side
            ...(isYouTube ? { youtubeHLS: true } : {}),
          }
        : {
            url: videoUrl,
            vCodec: 'h264',
            vQuality: '720',
            aFormat: 'mp3',
            isAudioOnly: true,
            isNoTTWatermark: true,
          };

    console.log(`Sending Cobalt request (${version}, alwaysProxy=${alwaysProxy}):`, JSON.stringify(requestBody));

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error('Cobalt API error:', response.status);
      lastErrorText = await response.text();
      console.error('Cobalt error body:', lastErrorText);
      return null;
    }

    const data = await response.json();
    console.log('Cobalt response:', JSON.stringify(data));

    if (data.status === 'error') {
      console.error('Cobalt returned error:', data.text ?? data.error?.code ?? data.error);
      lastErrorText = JSON.stringify(data);
      return null;
    }

    // Direct URL response (v10 format)
    if (data.url && !data.status) {
      console.log('Got direct URL from Cobalt');
      return { audioUrl: data.url as string, filename: data.filename as string | undefined, cobaltStatus: undefined };
    }

    if (data.status === 'stream' || data.status === 'redirect' || data.status === 'tunnel') {
      console.log(`Got ${data.status} response from Cobalt`);
      return {
        audioUrl: data.url as string,
        filename: data.filename as string | undefined,
        cobaltStatus: data.status as string,
      };
    }

    if (data.status === 'picker' && data.picker?.length > 0) {
      const audioOption = data.picker.find((p: { type?: string }) => p.type === 'audio');
      if (audioOption?.url) {
        console.log('Got audio from picker');
        return { audioUrl: audioOption.url as string, cobaltStatus: 'picker' };
      }
      if (data.picker[0]?.url) {
        console.log('Got first picker option');
        return { audioUrl: data.picker[0].url as string, cobaltStatus: 'picker' };
      }
    }

    console.log('No valid URL in Cobalt response');
    return null;
  };

  for (const { url: endpoint, version } of candidateEndpoints) {
    console.log(`Trying Cobalt endpoint (${version}):`, endpoint);

    try {
      // First attempt without forced proxy
      const first = await callCobalt(endpoint, version, false);

      if (first && first.cobaltStatus !== 'tunnel') {
        return first;
      }

      // Tunnel responses frequently fail with 0 bytes when fetched server-side.
      // Retry with alwaysProxy=true; if the server has API_ENABLE_DOWNLOAD_PROXY,
      // it might return a redirect URL instead.
      if (first?.cobaltStatus === 'tunnel') {
        console.log('Cobalt returned tunnel; retrying with alwaysProxy=true...');
        const second = await callCobalt(endpoint, version, true);
        if (second && second.cobaltStatus !== 'tunnel') {
          return second;
        }
        // Still a tunnel – return it anyway; we'll try downloading.
        return first;
      }
    } catch (error) {
      console.error('Cobalt request error:', error);
      lastErrorText = String(error);
      continue;
    }
  }

  console.log('All Cobalt endpoints failed');
  if (lastErrorText) console.log('Last Cobalt error (for debugging):', lastErrorText);
  return null;
}

// Get video title from YouTube page
async function getYouTubeTitle(videoId: string): Promise<string> {
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) return 'Video';

    const html = await response.text();
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    return titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : 'Video';
  } catch {
    return 'Video';
  }
}

// Fetch YouTube transcript using timedtext API (more reliable than player API)
async function fetchYouTubeTranscript(videoId: string): Promise<{ transcript: string; title: string } | null> {
  try {
    const videoPageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!videoPageResponse.ok) {
      return null;
    }

    const html = await videoPageResponse.text();

    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : 'Unknown Video';

    // Note: YouTube pages vary a lot. Don't early-return if we can't find a "captions" block;
    // we still might find timedtext URLs or captionTracks in ytInitialPlayerResponse.
    const captionMatch = html.match(/"captions":\s*(\{[^}]+\})/);
    if (!captionMatch) {
      console.log('No captions section found in page');
    }

    // Look for timedtext URL directly
    const timedtextMatch = html.match(/https:\/\/www\.youtube\.com\/api\/timedtext[^"]+/);
    if (timedtextMatch) {
      let captionUrl = timedtextMatch[0].replace(/\\u0026/g, '&');

      // Fetch the caption
      const captionResponse = await fetch(captionUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (captionResponse.ok) {
        const captionData = await captionResponse.text();

        // Parse XML or JSON captions
        const segments: TranscriptSegment[] = [];

        // Try XML format
        const textMatches = captionData.matchAll(/<text[^>]*>([^<]*)<\/text>/g);
        for (const match of textMatches) {
          let text = match[1];
          text = text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\n/g, ' ');

          if (text.trim()) {
            segments.push({ text: text.trim() });
          }
        }

        if (segments.length > 0) {
          const transcript = segments.map((s) => s.text).join(' ');
          console.log(`Got ${segments.length} caption segments`);
          return { transcript, title };
        }
      }
    }

    // Fallback: Try to extract from ytInitialPlayerResponse
    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/s);
    if (playerResponseMatch) {
      try {
        const playerData = JSON.parse(playerResponseMatch[1]);
        const captionTracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

        if (captionTracks && captionTracks.length > 0) {
          // Prefer English
          const englishTrack = captionTracks.find(
            (t: { languageCode: string }) => t.languageCode === 'en' || t.languageCode?.startsWith('en'),
          );
          const captionTrack = englishTrack || captionTracks[0];

          if (captionTrack.baseUrl) {
            const captionResponse = await fetch(captionTrack.baseUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              },
            });

            if (captionResponse.ok) {
              const captionXml = await captionResponse.text();
              const segments: TranscriptSegment[] = [];
              const textMatches = captionXml.matchAll(/<text[^>]*>([^<]*)<\/text>/g);

              for (const match of textMatches) {
                let text = match[1];
                text = text
                  .replace(/&amp;/g, '&')
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&quot;/g, '"')
                  .replace(/&#39;/g, "'")
                  .replace(/\n/g, ' ');

                if (text.trim()) {
                  segments.push({ text: text.trim() });
                }
              }

              if (segments.length > 0) {
                const transcript = segments.map((s) => s.text).join(' ');
                console.log(`Got ${segments.length} caption segments from player response`);
                return { transcript, title };
              }
            }
          }
        }
      } catch (e) {
        console.log('Could not parse player response:', e);
      }
    }

    console.log('No captions found');
    return null;
  } catch (error) {
    console.error('Error fetching YouTube transcript:', error);
    return null;
  }
}

// Helper to sleep for a given number of milliseconds
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Max audio size we'll attempt (ElevenLabs limit ~25MB, but we cap lower for edge memory)
const MAX_AUDIO_BYTES = 15 * 1024 * 1024; // 15MB limit for edge function safety

// Stream audio bytes in smaller chunks to avoid memory spikes
async function readResponseBytesStreaming(resp: Response, maxBytes: number): Promise<Uint8Array | null> {
  if (!resp.body) {
    const buf = await resp.arrayBuffer();
    return new Uint8Array(buf);
  }

  const reader = resp.body.getReader();
  // Pre-allocate a reasonable buffer - expand if needed
  let buffer = new Uint8Array(2 * 1024 * 1024); // Start with 2MB
  let offset = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      // Check if we need to expand buffer
      if (offset + value.length > buffer.length) {
        // Double the buffer or add needed space
        const newSize = Math.min(maxBytes + 1024, Math.max(buffer.length * 2, offset + value.length));
        if (newSize > maxBytes) {
          console.warn(`Audio exceeded ${maxBytes} bytes limit`);
          return null;
        }
        const newBuffer = new Uint8Array(newSize);
        newBuffer.set(buffer.subarray(0, offset));
        buffer = newBuffer;
      }

      buffer.set(value, offset);
      offset += value.length;

      // Safety check
      if (offset > maxBytes) {
        console.warn(`Audio exceeded ${maxBytes} bytes limit`);
        return null;
      }
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // ignore
    }
  }

  // Return only the used portion
  return buffer.subarray(0, offset);
}

async function downloadAudioBytes(
  url: string,
  opts?: { referer?: string; isTunnel?: boolean },
): Promise<Uint8Array | null> {
  const maxAttempts = opts?.isTunnel ? 4 : 2;
  // Use the global constant for memory safety
  const maxDownloadBytes = MAX_AUDIO_BYTES;

  const fetchOnce = async (attempt: number, urlToFetch: string) => {
    console.log(`Fetching audio (attempt ${attempt}):`, urlToFetch);

    try {
      // For tunnel URLs, use specific headers to force streaming
      const headers: Record<string, string> = {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'audio/mpeg, audio/mp4, audio/*, */*',
        'Accept-Encoding': 'identity', // Disable compression to get raw bytes
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      };

      if (opts?.referer) {
        headers['Referer'] = opts.referer;
      }

      // Some tunnel endpoints return 0 bytes unless the request looks like a real download.
      // Start with an open-ended range from byte 0.
      if (opts?.isTunnel) {
        if (attempt === 1) headers['Range'] = 'bytes=0-';
        if (attempt === 2) headers['Range'] = 'bytes=0-1048575';
        if (attempt >= 3) headers['Range'] = 'bytes=0-';
      }

      const resp = await fetch(urlToFetch, {
        redirect: 'follow',
        headers,
        cache: 'no-store',
      });

      console.log('Audio fetch status:', resp.status, resp.statusText);
      console.log('Audio content-type:', resp.headers.get('content-type'));
      console.log('Audio content-length:', resp.headers.get('content-length'));

      if (!resp.ok) {
        const t = await resp.text();
        console.error('Audio fetch failed body:', t.slice(0, 500));
        return null;
      }

      const debugClone = resp.clone();
      const bytes = await readResponseBytesStreaming(resp, maxDownloadBytes);
      if (!bytes) {
        console.error('Audio too large for edge function memory');
        return null;
      }
      console.log(`Downloaded ${bytes.length} bytes of audio`);

      if (bytes.length === 0) {
        // Helpful for diagnosing cases where the tunnel returns an HTML error page
        // but hides it behind odd headers.
        try {
          const preview = await debugClone.text();
          console.log('0-byte audio response preview:', preview.slice(0, 300));
        } catch {
          // ignore
        }
      }

      return bytes;
    } catch (error) {
      console.error(`Fetch attempt ${attempt} error:`, error);
      return null;
    }
  };

  // For tunnel URLs, add delays between attempts to let the stream buffer
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Warm-up delay for tunnel URLs: sometimes the tunnel is created before the stream is ready.
    if (attempt === 1 && opts?.isTunnel) {
      await sleep(1200);
    }

    // Add delay before retry (not on first attempt)
    if (attempt > 1) {
      const delayMs = attempt * 500; // 500ms, 1000ms, 1500ms...
      console.log(`Waiting ${delayMs}ms before retry...`);
      await sleep(delayMs);
    }

    // Add cache-busting on retries
    let urlToFetch = url;
    // IMPORTANT: don't modify signed /tunnel URLs (extra query params can invalidate signatures)
    if (attempt > 1 && !opts?.isTunnel) {
      const separator = url.includes('?') ? '&' : '?';
      urlToFetch = `${url}${separator}cb=${Date.now()}`;
    }

    const result = await fetchOnce(attempt, urlToFetch);
    if (result && result.length > 0) return result;
  }

  console.error('All download attempts failed');
  return null;
}

// Transcribe audio using ElevenLabs Scribe API
async function transcribeWithElevenLabs(
  audioData: string | Uint8Array,
  mimeType: string = 'audio/mpeg',
): Promise<string | null> {
  const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

  if (!ELEVENLABS_API_KEY) {
    console.log('ElevenLabs API key not configured');
    return null;
  }

  try {
    let bytes: Uint8Array;

    if (typeof audioData === 'string') {
      const binaryString = atob(audioData);
      bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
    } else {
      bytes = audioData;
    }

    const formData = new FormData();
    const arrayBuffer = new ArrayBuffer(bytes.length);
    new Uint8Array(arrayBuffer).set(bytes);
    const audioBlob = new Blob([arrayBuffer], { type: mimeType });

    let extension = 'mp3';
    if (mimeType.includes('mp4') || mimeType.includes('m4a')) {
      extension = 'm4a';
    } else if (mimeType.includes('webm') || mimeType.includes('opus')) {
      extension = 'webm';
    }

    formData.append('file', audioBlob, `audio.${extension}`);
    formData.append('model_id', 'scribe_v2');
    formData.append('tag_audio_events', 'false');
    formData.append('diarize', 'false');

    console.log(`Sending ${bytes.length} bytes to ElevenLabs STT...`);

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs STT error:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    return result.text || null;
  } catch (error) {
    console.error('ElevenLabs transcription error:', error);
    return null;
  }
}

// Extract audio with Cobalt and transcribe with ElevenLabs
async function extractAndTranscribe(
  videoUrl: string,
  platform: string,
): Promise<{ transcript: string; title: string } | null> {
  console.log(`Extracting audio for ${platform} video...`);

  // Get title for YouTube
  let title = 'Video';
  if (platform === 'youtube') {
    const videoId = extractYouTubeVideoId(videoUrl);
    if (videoId) {
      title = await getYouTubeTitle(videoId);
    }
  }

  // Extract audio with Cobalt + download + transcribe.
  // If the tunnel URL returns a 0-byte body (often transient), retry once to obtain a fresh tunnel URL.
  for (let attempt = 1; attempt <= 2; attempt++) {
    if (attempt > 1) console.log('Retrying Cobalt extraction/transcription...');

    const audioInfo = await extractAudioWithCobalt(videoUrl, { platform: platform as any });
    if (!audioInfo) {
      console.log('Cobalt could not extract audio');
      continue;
    }

    console.log('Got audio URL from Cobalt, fetching audio...');
    const isTunnel = audioInfo.cobaltStatus === 'tunnel' || audioInfo.audioUrl.includes('/tunnel');

    try {
      const audioBytes = await downloadAudioBytes(audioInfo.audioUrl, {
        referer: videoUrl,
        isTunnel,
      });
      if (!audioBytes) {
        console.error('Failed to download audio bytes');
        continue;
      }

      // Check size limit (ElevenLabs has ~25MB limit)
      const maxSize = 25 * 1024 * 1024;
      if (audioBytes.length > maxSize) {
        console.log('Audio file too large for transcription');
        return null;
      }

      // Transcribe with ElevenLabs
      const transcript = await transcribeWithElevenLabs(audioBytes, 'audio/mpeg');

      if (!transcript) {
        console.log('ElevenLabs transcription failed');
        continue;
      }

      return { transcript, title };
    } catch (error) {
      console.error('Error in audio extraction/transcription:', error);
      continue;
    }
  }

  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      url,
      instruction,
      transcript: userTranscript,
      audioBase64,
      topics,
      tags,
      currentDate,
    }: RequestBody = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const platform = detectPlatform(url);
    let transcript: string | null = null;
    let videoTitle = 'Video';
    const hasElevenLabs = !!Deno.env.get('ELEVENLABS_API_KEY');

    // Priority 1: User provided transcript
    if (userTranscript && userTranscript.trim()) {
      console.log('Using user-provided transcript');
      transcript = userTranscript.trim();
    }
    // Priority 2: User provided audio file for transcription
    else if (audioBase64) {
      console.log('Transcribing user-uploaded audio with ElevenLabs...');
      transcript = await transcribeWithElevenLabs(audioBase64);
      if (!transcript) {
        return new Response(
          JSON.stringify({
            error: 'Failed to transcribe audio',
            needsTranscript: true,
            message: 'Could not transcribe the audio file. Please paste the transcript manually.',
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }
    // Priority 3: YouTube - try captions first, then Cobalt + ElevenLabs
    else if (platform === 'youtube') {
      const videoId = extractYouTubeVideoId(url);
      if (!videoId) {
        return new Response(JSON.stringify({ error: 'Invalid YouTube URL', needsTranscript: true }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Try captions first (faster, no API cost)
      console.log('Attempting to fetch YouTube captions...');
      const captionResult = await fetchYouTubeTranscript(videoId);

      if (captionResult) {
        console.log('Got captions from YouTube');
        transcript = captionResult.transcript;
        videoTitle = captionResult.title;
      }
      // No captions - try Cobalt + ElevenLabs
      else if (hasElevenLabs) {
        console.log('No captions, using Cobalt + ElevenLabs...');
        const sttResult = await extractAndTranscribe(url, platform);

        if (sttResult) {
          console.log('Successfully transcribed via Cobalt + ElevenLabs');
          transcript = sttResult.transcript;
          videoTitle = sttResult.title;
        } else {
          return new Response(
            JSON.stringify({
              error: 'Could not extract audio',
              needsTranscript: true,
              platform: 'youtube',
              canUploadAudio: true,
              message:
                'Could not automatically transcribe this video. Please upload an audio file or paste the transcript manually.',
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          );
        }
      } else {
        return new Response(
          JSON.stringify({
            error: 'Could not retrieve captions',
            needsTranscript: true,
            platform: 'youtube',
            canUploadAudio: false,
            message: "This video doesn't have available captions. Please paste the transcript manually.",
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }
    // Priority 4: Other platforms - try Cobalt + ElevenLabs
    else if (hasElevenLabs && platform !== 'unknown') {
      console.log(`Using Cobalt + ElevenLabs for ${platform}...`);
      const sttResult = await extractAndTranscribe(url, platform);

      if (sttResult) {
        console.log('Successfully transcribed via Cobalt + ElevenLabs');
        transcript = sttResult.transcript;
        videoTitle = sttResult.title || `${platform.charAt(0).toUpperCase() + platform.slice(1)} Video`;
      } else {
        return new Response(
          JSON.stringify({
            error: `Could not extract audio from ${platform}`,
            needsTranscript: true,
            platform,
            canUploadAudio: true,
            message:
              'Could not automatically transcribe this video. Please upload an audio file or paste the transcript manually.',
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }
    // Priority 5: Unknown platform or no ElevenLabs
    else {
      return new Response(
        JSON.stringify({
          error: `${platform === 'unknown' ? 'Unknown platform' : platform.charAt(0).toUpperCase() + platform.slice(1)} requires manual input`,
          needsTranscript: true,
          platform,
          canUploadAudio: hasElevenLabs,
          message: hasElevenLabs
            ? 'Upload an audio file to transcribe, or paste the transcript manually.'
            : 'Please paste the video transcript manually.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Build topic and tag context for AI
    const topicList = topics
      .map((t) => {
        const pages = t.pages?.map((p) => `  - ${t.name}/${p.name}`).join('\n') || '';
        return `- ${t.name}${pages ? '\n' + pages : ''}`;
      })
      .join('\n');

    const tagList = tags.map((t) => `#${t.name}`).join(', ');

    // Process with AI
    const systemPrompt = `You are an AI assistant for Kaivoo, a personal productivity app. Your job is to process video transcripts and turn them into structured, useful notes.

CURRENT DATE: ${currentDate}
VIDEO TITLE: ${videoTitle}
SOURCE URL: ${url}

AVAILABLE TOPICS (use exact names with [[Topic]] or [[Topic/Page]] syntax):
${topicList || 'No topics yet'}

AVAILABLE TAGS (use exact names with # prefix):
${tagList || 'No tags yet'}

USER INSTRUCTION: ${instruction || 'Process this video into a useful note'}

RULES:
1. Create a clean, well-structured note from the transcript
2. For recipes: Extract ingredients list and step-by-step instructions
3. For tutorials: Summarize key points and actionable steps
4. For informational content: Create a summary with key takeaways
5. Suggest the most appropriate [[Topic/Page]] based on content and user instruction
6. Suggest relevant #tags
7. If the content suggests actionable tasks, include them as optional task suggestions
8. Keep the note concise but complete - remove filler words and repetition from transcript
9. Use ONLY existing topics/tags when possible, or suggest new ones clearly marked as [NEW]
10. Format the note content using proper Markdown (headers, bold, lists, etc.)

OUTPUT FORMAT (JSON):
{
  "note": {
    "title": "Clear, descriptive title",
    "content": "The processed note content in markdown format. Use headers, lists, etc.",
    "topicPath": "[[Topic/Page]]" or null,
    "tags": ["#tag1", "#tag2"],
    "isNewTopic": false,
    "isNewTag": false,
    "sourceUrl": "${url}"
  },
  "tasks": [
    {
      "title": "Optional task extracted from content",
      "priority": "low | medium | high",
      "topicPath": "[[Topic/Page]]" or null
    }
  ]
}

The tasks array can be empty if no actionable items are in the content.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Here is the video transcript to process:\n\n${transcript}` },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue using AI features.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'Failed to process with AI' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: 'No response from AI' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      return new Response(JSON.stringify({ error: 'Invalid AI response format' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        ...parsed,
        videoTitle,
        platform,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (e) {
    console.error('AI video capture error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
