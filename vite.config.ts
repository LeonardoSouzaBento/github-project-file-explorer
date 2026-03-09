import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import * as path from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [react(), dts({ insertTypesEntry: true, tsconfigPath: "./tsconfig.app.json" })],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/pages/Index.tsx"),
      name: "GitFileExplorer",
      formats: ["es", "umd"],
      fileName: (format) => `git-file-explorer.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
