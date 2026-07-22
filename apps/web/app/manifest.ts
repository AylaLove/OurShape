import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Family Participation Game",
    short_name: "Our Home",
    description: "A shared daily household participation game.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7f4",
    theme_color: "#183c33",
  };
}

