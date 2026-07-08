import type { Metadata, Viewport } from "next";
import { Instrument_Sans, JetBrains_Mono, Syne } from "next/font/google";

import "./globals.css";
import { education, person } from "@/lib/resume";
import { SITE_URL } from "@/lib/utils";
import { Providers } from "@/components/providers";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

const TITLE = `${person.name} — ${person.title} · ${person.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s · ${person.name}`,
  },
  description: person.summary,
  keywords: [
    "Ashutosh Gupta",
    "Senior Software Engineer",
    "Python Developer",
    "Backend Engineer",
    "FastAPI",
    "AI Platforms",
    "Agentic AI",
    "Google Cloud",
    "Distributed Systems",
    "Noida",
  ],
  authors: [{ name: person.name, url: person.links.github }],
  creator: person.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: `${person.name} — Portfolio`,
    title: TITLE,
    description: person.intro,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: person.intro,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#05070f" },
    { media: "(prefers-color-scheme: light)", color: "#f3f5fb" },
  ],
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: person.name,
  jobTitle: person.title,
  description: person.summary,
  email: `mailto:${person.email}`,
  url: SITE_URL,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Noida",
    addressCountry: "IN",
  },
  worksFor: { "@type": "Organization", name: "UKG (Ultimate Kronos Group)" },
  alumniOf: education.map((degree) => ({
    "@type": "CollegeOrUniversity",
    name: degree.institute,
  })),
  sameAs: [person.links.github, person.links.linkedin, person.links.codechef],
  knowsAbout: [
    "Python",
    "FastAPI",
    "Backend Engineering",
    "Generative AI",
    "Agentic AI",
    "Google Cloud",
    "Distributed Systems",
    "System Design",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${syne.variable} ${instrument.variable} ${jetbrains.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  );
}
