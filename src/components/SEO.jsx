import { Helmet } from "react-helmet-async";

const SITE_NAME = "IdeaCloud";
const BASE_URL = "https://ideacloud.vercel.app";

export default function SEO({ title, description, path }) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Where Ideas Meet Sponsors`;
  const url = `${BASE_URL}${path ?? "/"}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description ?? "Browse and share innovative ideas. IdeaCloud connects idea generators with sponsors looking for the next big thing."} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description ?? "Browse and share innovative ideas on IdeaCloud."} />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
}
