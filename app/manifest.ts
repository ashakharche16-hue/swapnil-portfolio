import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Swapnil Kharche — Portfolio",
    short_name: "SK Portfolio",
    description:
      "Software Development Manager & Engineering Leader — portfolio and live RAG demo.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0F1A",
    theme_color: "#0B0F1A",
    icons: [{ src: "/icon", sizes: "64x64", type: "image/png" }],
  };
}
