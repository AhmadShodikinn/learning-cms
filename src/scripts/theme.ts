const THEME_KEY = "theme";
const LIGHT = "light";
const DARK = "dark";
type Theme = typeof LIGHT | typeof DARK;
type ThemeState = { value: Theme; stored: boolean };

const media = window.matchMedia("(prefers-color-scheme: dark)");
const initialState = (window as unknown as { __theme?: ThemeState }).__theme;
let themeValue: Theme = initialState?.value ?? (media.matches ? DARK : LIGHT);
let hasStoredTheme = initialState?.stored ?? false;

function reflect(): void {
  const root = document.documentElement;
  root.setAttribute("data-theme", themeValue);
  root.classList.toggle("dark", themeValue === DARK);
  root.style.colorScheme = themeValue;

  const button = document.querySelector<HTMLButtonElement>("#theme-btn");
  if (button) {
    const nextTheme = themeValue === LIGHT ? DARK : LIGHT;
    const label =
      button.dataset[nextTheme + "Label"] ?? `Use ${nextTheme} theme`;
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    button.setAttribute("aria-pressed", String(themeValue === DARK));
  }

  const bg = window.getComputedStyle(document.body).backgroundColor;
  document
    .querySelector("meta[name='theme-color']")
    ?.setAttribute("content", bg);
}

function persist(): void {
  try {
    localStorage.setItem(THEME_KEY, themeValue);
    hasStoredTheme = true;
  } catch {}
  reflect();
}

function setup(): void {
  reflect();
  const button = document.querySelector<HTMLButtonElement>("#theme-btn");
  if (!button || button.dataset.themeReady) return;
  button.dataset.themeReady = "true";
  button.addEventListener("click", () => {
    themeValue = themeValue === LIGHT ? DARK : LIGHT;
    persist();
  });
}

setup();
document.addEventListener("astro:after-swap", setup);

document.addEventListener("astro:before-swap", event => {
  const color = document
    .querySelector("meta[name='theme-color']")
    ?.getAttribute("content");
  if (color) {
    (event as { newDocument: Document }).newDocument
      .querySelector("meta[name='theme-color']")
      ?.setAttribute("content", color);
  }
});

media.addEventListener("change", ({ matches }) => {
  if (hasStoredTheme) return;
  themeValue = matches ? DARK : LIGHT;
  reflect();
});
