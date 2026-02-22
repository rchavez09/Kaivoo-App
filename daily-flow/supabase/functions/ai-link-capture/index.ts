import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
  topics: TopicContext[];
  tags: TagContext[];
  currentDate: string;
}

// Detect content type from URL
function detectContentType(url: string): 'recipe' | 'article' | 'general' {
  const lowerUrl = url.toLowerCase();
  
  // Recipe sites
  const recipeSites = [
    'allrecipes.com', 'food.com', 'epicurious.com', 'bonappetit.com',
    'tasty.co', 'delish.com', 'foodnetwork.com', 'simplyrecipes.com',
    'seriouseats.com', 'kingarthurbaking.com', 'budgetbytes.com',
    'cookinglight.com', 'myrecipes.com', 'eatingwell.com', 'yummly.com',
    'recipe', 'cooking', 'food', 'baking'
  ];
  
  if (recipeSites.some(site => lowerUrl.includes(site))) {
    return 'recipe';
  }
  
  // Article/News sites
  const articleSites = [
    'medium.com', 'substack.com', 'notion.so', 'dev.to',
    'hackernoon.com', 'towardsdatascience.com', 'blog', 'article'
  ];
  
  if (articleSites.some(site => lowerUrl.includes(site))) {
    return 'article';
  }
  
  return 'general';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, instruction, topics, tags, currentDate }: RequestBody = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }
    
    if (!FIRECRAWL_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: "Firecrawl is not configured. Please connect Firecrawl in Settings.",
          needsSetup: true
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping URL:', formattedUrl);

    // Scrape the URL with Firecrawl
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    });

    if (!scrapeResponse.ok) {
      const errorData = await scrapeResponse.json();
      console.error('Firecrawl error:', errorData);
      return new Response(
        JSON.stringify({ 
          error: errorData.error || `Failed to scrape page (${scrapeResponse.status})`,
          needsManualInput: true,
          message: "Couldn't access this page. You can paste the content manually."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const scrapeData = await scrapeResponse.json();
    const pageContent = scrapeData.data?.markdown || scrapeData.markdown;
    const pageTitle = scrapeData.data?.metadata?.title || scrapeData.metadata?.title || 'Untitled';

    if (!pageContent) {
      return new Response(
        JSON.stringify({ 
          error: "No content found on page",
          needsManualInput: true,
          message: "Couldn't extract content. You can paste it manually."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Scraped content length:', pageContent.length, 'characters');

    // Detect content type for better AI processing
    const contentType = detectContentType(formattedUrl);

    // Build topic and tag context for AI
    const topicList = topics.map(t => {
      const pages = t.pages?.map(p => `  - ${t.name}/${p.name}`).join('\n') || '';
      return `- ${t.name}${pages ? '\n' + pages : ''}`;
    }).join('\n');

    const tagList = tags.map(t => `#${t.name}`).join(', ');

    // Build content-specific instructions
    let contentInstructions = '';
    if (contentType === 'recipe' || instruction?.toLowerCase().includes('recipe')) {
      contentInstructions = `
This appears to be a RECIPE. Structure the note as:
1. Brief intro (1-2 sentences about the dish)
2. **Ingredients** - Clean list with quantities
3. **Instructions** - Numbered steps, clear and concise
4. **Notes** - Any tips, variations, or storage info

Suggested tasks: "Make [dish name]", "Buy ingredients for [dish]"`;
    } else if (contentType === 'article') {
      contentInstructions = `
This is an ARTICLE. Structure the note as:
1. **Summary** - 2-3 sentence overview
2. **Key Points** - Bullet list of main takeaways
3. **Quotes** - Any standout quotes (if relevant)
4. **Action Items** - What can be applied from this`;
    } else {
      contentInstructions = `
Structure the note based on content type:
- For tutorials: Steps + key concepts
- For reference: Organized sections
- For guides: Summary + actionable items`;
    }

    // Process with AI
    const systemPrompt = `You are an AI assistant for Kaivoo, a personal productivity app. Your job is to process web content and turn it into structured, useful notes.

CURRENT DATE: ${currentDate}
PAGE TITLE: ${pageTitle}
SOURCE URL: ${formattedUrl}
DETECTED CONTENT TYPE: ${contentType}

AVAILABLE TOPICS (use exact names with [[Topic]] or [[Topic/Page]] syntax):
${topicList || 'No topics yet'}

AVAILABLE TAGS (use exact names with # prefix):
${tagList || 'No tags yet'}

USER INSTRUCTION: ${instruction || 'Process this content into a useful note'}

${contentInstructions}

RULES:
1. Create a clean, well-structured note from the page content
2. Remove ads, navigation, comments, and irrelevant content
3. Keep essential information - don't over-summarize
4. Suggest the most appropriate [[Topic/Page]] based on content and user instruction
5. Suggest relevant #tags (2-4 tags)
6. If the content suggests actionable tasks, include them
7. Use ONLY existing topics/tags when possible, or suggest new ones clearly marked as [NEW]

OUTPUT FORMAT (JSON):
{
  "note": {
    "title": "Clear, descriptive title",
    "content": "The processed note content in markdown format. Use headers, lists, etc.",
    "topicPath": "[[Topic/Page]]" or null,
    "tags": ["#tag1", "#tag2"],
    "isNewTopic": false,
    "isNewTag": false,
    "sourceUrl": "${formattedUrl}"
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

    // Truncate content if too long (keep first 15k chars)
    const truncatedContent = pageContent.length > 15000 
      ? pageContent.substring(0, 15000) + '\n\n[Content truncated...]'
      : pageContent;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here is the web page content to process:\n\n${truncatedContent}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue using AI features." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to process with AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({
      ...parsed,
      pageTitle,
      contentType,
      sourceUrl: formattedUrl,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("AI link capture error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
