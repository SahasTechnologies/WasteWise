// Vercel serverless function — reveals contact email only after Turnstile verification
// This obfuscates the email from public view and prevents scraping

export const prerender = false;

export async function POST(context) {
  try {
    const request = context?.request ?? context;
    const body = await request.json();
    const { 'cf-turnstile-response': turnstileToken } = body;

    // Verify Turnstile token before revealing email
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      return new Response(JSON.stringify({ ok: false, error: 'Server misconfigured' }), { status: 500 });
    }

    if (!turnstileToken) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing CAPTCHA token' }), { status: 403 });
    }

    const cfData = new URLSearchParams();
    cfData.append('secret', secret);
    cfData.append('response', turnstileToken);

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: cfData.toString(),
    });
    const verifyJson = await verifyRes.json();

    if (!verifyJson.success) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid CAPTCHA' }), { status: 403 });
    }

    // Reveal the email from environment variable
    const email = process.env.CONTACT_EMAIL || 'wastewise@shimpi.dev';
    return new Response(JSON.stringify({ ok: true, email }), { status: 200 });
  } catch (err) {
    console.error('get-contact-email error:', err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
  }
}
