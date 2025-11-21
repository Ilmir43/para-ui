import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 5173,
    fs: {
      // разрешаем читать абсолютные пути, указанные в .env (используется /@fs/...)
      allow: ["/"],
    },
  },
  build: {
    target: "esnext",
  },
});
