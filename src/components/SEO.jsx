import { Helmet } from "react-helmet-async";

const SITE_NAME = "IdeaCloud";
const BASE_URL = "https://ideacloud-itrans.vercel.app";
const OG_IMAGE = `${BASE_URL}/og-image.png`;

export default function SEO({
  title,
  description,
  path,
  type = "website",
  robots = "index, follow",
  jsonLd,
}) {
  const fullTitle = title
    ? title === SITE_NAME
      ? `${SITE_NAME} — Where Ideas Meet Sponsors`
      : `${title} — ${SITE_NAME}`
    : `${SITE_NAME} — Where Ideas Meet Sponsors`;
  const url = `${BASE_URL}${path ?? "/"}`;
  const desc =
    description ??
    "IdeaCloud connects idea generators with sponsors. Browse and share innovative ideas, and reach the people who can fund them.";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${SITE_NAME} — Where Ideas Meet Sponsors`} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={OG_IMAGE} />

      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Helmet>
  );
}
