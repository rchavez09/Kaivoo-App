import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Apply stored theme before first render to prevent flash of wrong theme
(() => {
  try {
    const stored = localStorage.getItem('kaivoo-theme');
    const theme = stored ? JSON.parse(stored) : 'system';
    const shouldBeDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  } catch {
    // Fallback: respect system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', prefersDark);
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
