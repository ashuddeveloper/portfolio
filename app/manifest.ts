export const dynamic = "force-static";

import type { MetadataRoute } from "next";

import { person } from "@/lib/resume";
import { BASE_PATH } from "@/lib/utils";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${person.name} — ${person.title}`,
    short_name: person.firstName,
    description: person.summary,
    start_url: `${BASE_PATH}/`,
    scope: `${BASE_PATH}/`,
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#05070f",
    theme_color: "#05070f",
    icons: [
      { src: `${BASE_PATH}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${BASE_PATH}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
      {
        src: `${BASE_PATH}/icons/maskable-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
