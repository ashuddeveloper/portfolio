/**
 * Privacy-friendly analytics, enabled only when configured:
 *   NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com  → loads Plausible
 * On Vercel you can additionally `npm i @vercel/analytics` and drop its
 * component here — see README → Analytics.
 */
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;
  return (
    <script defer data-domain={domain} src="https://plausible.io/js/script.outbound-links.js" />
  );
}
