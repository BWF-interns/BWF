import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Borderless World Foundation Student Portal",
    short_name: "BWF Portal",
    description:
      "A dedicated portal for BWF students to access educational resources.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3b515d",
    icons: [
      {
        src: "/icons/logo.png", // Ensure this path exists in your public folder
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
