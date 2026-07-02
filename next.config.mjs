/** @type {import('next').NextConfig} */
const nextConfig = {
  // Heavy / native RAG-demo packages run in Node route handlers — don't bundle them.
  experimental: {
    serverComponentsExternalPackages: [
      "@huggingface/transformers",
      "onnxruntime-node",
      "sharp",
      "tesseract.js",
      "unpdf",
    ],
  },
};

export default nextConfig;
