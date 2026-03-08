import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

/**
 * License Key Generation Edge Function — Sprint 25 P5
 *
 * Triggered by Stripe webhook (checkout.session.completed).
 * Signs license payload with Ed25519 private key using @noble/ed25519.
 * Stores record in `licenses` table. Customer receives key via Stripe receipt.
 *
 * Environment variables required:
 *   LICENSE_SIGNING_KEY — hex-encoded Ed25519 private key (32 bytes)
 *   STRIPE_WEBHOOK_SECRET — Stripe webhook signing secret
 *   STRIPE_SECRET_KEY — Stripe secret key (for retrieving session details)
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { ed25519 } from 'npm:@noble/curves@1/ed25519';
import { hmac } from 'npm:@noble/hashes@1/hmac';
import { sha256 } from 'npm:@noble/hashes@1/sha256';

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || '*';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

// ─── Stripe Webhook Signature Verification ───

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function toBase64Url(bytes: Uint8Array): string {
  const binary = Array.from(bytes)
    .map((b) => String.fromCharCode(b))
    .join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function verifyStripeSignature(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  const parts = sigHeader.split(',');
  const timestamp = parts.find((p) => p.startsWith('t='))?.slice(2);
  const v1Sig = parts.find((p) => p.startsWith('v1='))?.slice(3);
  if (!timestamp || !v1Sig) return false;

  // Stripe signs: timestamp + "." + payload
  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const message = encoder.encode(signedPayload);
  const expected = hmac(sha256, key, message);

  return bytesToHex(expected) === v1Sig;
}

// ─── License Key Generation ───

interface LicensePayload {
  v: number; // format version
  t: number; // tier: 0=founding, 1=standard
  i: number; // issued_at (days since epoch)
  e: string; // first 8 hex chars of SHA-256(email)
  f: number; // flags bitfield
}

function hashEmail(email: string): string {
  const hash = sha256(new TextEncoder().encode(email.toLowerCase().trim()));
  return bytesToHex(hash).substring(0, 8);
}

function buildLicensePayload(tier: 'founding' | 'standard', email: string): LicensePayload {
  const daysSinceEpoch = Math.floor(Date.now() / (86400 * 1000));
  return {
    v: 1,
    t: tier === 'founding' ? 0 : 1,
    i: daysSinceEpoch,
    e: hashEmail(email),
    f: 0,
  };
}

function signLicense(payload: LicensePayload, privateKeyHex: string): string {
  const payloadJson = JSON.stringify(payload);
  const payloadBytes = new TextEncoder().encode(payloadJson);
  const privKey = hexToBytes(privateKeyHex);
  const signature = ed25519.sign(payloadBytes, privKey);

  // Combine: payload length (2 bytes) + payload + signature
  const combined = new Uint8Array(2 + payloadBytes.length + signature.length);
  combined[0] = (payloadBytes.length >> 8) & 0xff;
  combined[1] = payloadBytes.length & 0xff;
  combined.set(payloadBytes, 2);
  combined.set(signature, 2 + payloadBytes.length);

  const encoded = toBase64Url(combined);

  // Format as Kaivoo license block
  const tierLabel = payload.t === 0 ? 'Founding Member' : 'Standard';
  const lines: string[] = [];
  lines.push('----- BEGIN KAIVOO LICENSE -----');
  lines.push(`Kaivoo ${tierLabel} - Single User License`);
  // Split encoded key into 48-char lines
  for (let i = 0; i < encoded.length; i += 48) {
    lines.push(encoded.substring(i, i + 48));
  }
  lines.push('----- END KAIVOO LICENSE -----');

  return lines.join('\n');
}

// ─── Stripe Helpers ───

interface StripeSession {
  id: string;
  customer_email?: string;
  customer_details?: { email?: string };
  metadata?: Record<string, string>;
  payment_status: string;
  amount_total: number;
}

async function getStripeSession(sessionId: string, stripeKey: string): Promise<StripeSession> {
  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${stripeKey}` },
  });
  if (!res.ok) throw new Error(`Stripe API error: ${res.status}`);
  return res.json();
}

// ─── Main Handler ───

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  }

  const signingKey = Deno.env.get('LICENSE_SIGNING_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!signingKey || !webhookSecret || !stripeKey || !supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: 'Server misconfigured — missing secrets' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.text();
    const sigHeader = req.headers.get('stripe-signature');

    if (!sigHeader) {
      return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify Stripe webhook signature
    const valid = await verifyStripeSignature(body, sigHeader, webhookSecret);
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const event = JSON.parse(body);

    // Only process checkout.session.completed
    if (event.type !== 'checkout.session.completed') {
      return new Response(JSON.stringify({ received: true, skipped: event.type }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const session: StripeSession = event.data.object;
    const email = session.customer_email || session.customer_details?.email || '';

    if (!email) {
      console.error('No email found in Stripe session:', session.id);
      return new Response(JSON.stringify({ error: 'No customer email in session' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Determine tier from metadata or amount
    const tier: 'founding' | 'standard' =
      session.metadata?.tier === 'standard' || (session.amount_total && session.amount_total >= 9900)
        ? 'standard'
        : 'founding';

    // Generate license key
    const payload = buildLicensePayload(tier, email);
    const licenseKey = signLicense(payload, signingKey);

    // Store license record in Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { error: dbError } = await supabase.from('licenses').insert({
      email_hash: payload.e,
      tier,
      stripe_session_id: session.id,
      license_key: licenseKey,
      issued_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error('Failed to store license:', dbError);
      // Still return success — key was generated, just not stored
    }

    // Note: The license key delivery to the customer happens via:
    // 1. Stripe receipt email (configured in Stripe Dashboard)
    // 2. The success page that the customer is redirected to
    // For MVP, we store the key and the success page retrieves it

    return new Response(
      JSON.stringify({
        success: true,
        tier,
        email_hash: payload.e,
        session_id: session.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('License keygen error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
