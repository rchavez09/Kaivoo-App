import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

/**
 * Stripe Checkout Session — Sprint 25 P8
 *
 * Creates a Stripe Checkout session for Kaivoo license purchase.
 * Called from the landing page / marketing site.
 *
 * Environment variables:
 *   STRIPE_SECRET_KEY — Stripe secret key
 *   STRIPE_FOUNDING_PRICE_ID — Price ID for $49 Founding Member tier
 *   STRIPE_STANDARD_PRICE_ID — Price ID for $99 Standard tier
 *   CHECKOUT_SUCCESS_URL — URL to redirect after successful purchase
 *   CHECKOUT_CANCEL_URL — URL to redirect on cancel
 */

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || '*';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  const foundingPriceId = Deno.env.get('STRIPE_FOUNDING_PRICE_ID');
  const standardPriceId = Deno.env.get('STRIPE_STANDARD_PRICE_ID');
  const successUrl = Deno.env.get('CHECKOUT_SUCCESS_URL') || 'https://kaivoo.app/purchase/success';
  const cancelUrl = Deno.env.get('CHECKOUT_CANCEL_URL') || 'https://kaivoo.app';

  if (!stripeKey || !foundingPriceId || !standardPriceId) {
    return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { tier } = await req.json();
    const priceId = tier === 'standard' ? standardPriceId : foundingPriceId;

    // Create Stripe Checkout session via API
    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('payment_method_types[]', 'card');
    params.append('line_items[0][price]', priceId);
    params.append('line_items[0][quantity]', '1');
    params.append('success_url', `${successUrl}?session_id={CHECKOUT_SESSION_ID}`);
    params.append('cancel_url', cancelUrl);
    params.append('metadata[tier]', tier || 'founding');

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const err = await res.json();
      return new Response(JSON.stringify({ error: err.error?.message || 'Stripe error' }), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const session = await res.json();

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
