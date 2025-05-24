import { writable } from "svelte/store";
import { browser } from "$app/environment";

const createThemeStore = () => {
  const { subscribe, set } = writable<"light" | "dark">("light");

  return {
    subscribe,
    toggle: () => {
      if (browser) {
        const currentTheme = document.documentElement.classList.contains("dark")
          ? "dark"
          : "light";
        const newTheme = currentTheme === "dark" ? "light" : "dark";

        document.documentElement.classList.toggle("dark");
        localStorage.setItem("theme", newTheme);
        set(newTheme);
      }
    },
    init: () => {
      if (browser) {
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        const theme = savedTheme || (prefersDark ? "dark" : "light");

        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        }
        set(theme as "light" | "dark");
      }
    },
  };
};

export const theme = createThemeStore();
