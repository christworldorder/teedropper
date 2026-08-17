export function GET() {
  return new Response(
    `User-agent: *
Allow: /

Sitemap: https://www.teedropper.com/sitemap.xml`,
    { headers: { "Content-Type": "text/plain" } }
  );
}
