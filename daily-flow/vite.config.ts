import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-recharts': ['recharts'],
          'vendor-tiptap': [
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-highlight',
            '@tiptap/extension-color',
            '@tiptap/extension-text-style',
            '@tiptap/extension-placeholder',
          ],
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-alert-dialog',
          ],
        },
      },
    },
  },
}));
