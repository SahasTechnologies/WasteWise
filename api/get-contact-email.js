// Vercel serverless function — reveals contact email only after Turnstile verification
// This obfuscates the email from public view and prevents scraping

export const prerender = false;

export async function POST(context) {
  try {
    const request = context?.request ?? context;
    const body = await request.json();
    const { 'cf-turnstile-response': turnstileToken } = body;
    console.log(`[get-contact-email] Received request with token: ${turnstileToken ? 'present' : 'missing'}`);

    // Verify Turnstile token before revealing email
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      console.error('[get-contact-email] TURNSTILE_SECRET_KEY not set');
      return new Response(JSON.stringify({ ok: false, error: 'Server misconfigured' }), { status: 500 });
    }

    if (!turnstileToken) {
      console.error('[get-contact-email] Missing CAPTCHA token');
      return new Response(JSON.stringify({ ok: false, error: 'Missing CAPTCHA token' }), { status: 403 });
    }

    const cfData = new URLSearchParams();
    cfData.append('secret', secret);
    cfData.append('response', turnstileToken);

    console.log('[get-contact-email] Verifying Turnstile token...');
    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: cfData.toString(),
    });
    const verifyJson = await verifyRes.json();
    console.log('[get-contact-email] Turnstile verification result:', verifyJson);

    if (!verifyJson.success) {
      console.error('[get-contact-email] Turnstile verification failed');
      return new Response(JSON.stringify({ ok: false, error: 'Invalid CAPTCHA' }), { status: 403 });
    }

    // Reveal the email from environment variable
    const email = process.env.CONTACT_EMAIL || 'wastewise@shimpi.dev';
    console.log(`[get-contact-email] Revealing email: ${email}`);
    return new Response(JSON.stringify({ ok: true, email }), { status: 200 });
  } catch (err) {
    console.error('[get-contact-email] Error:', err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
  }
}
