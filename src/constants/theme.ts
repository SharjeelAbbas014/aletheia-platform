export const tailwindConfig = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface-variant": "#353436",
        "outline-variant": "#464554",
        "on-primary-fixed": "#07006c",
        "tertiary-container": "#8392a6",
        "primary-fixed": "#e1e0ff",
        "on-primary-container": "#0d0096",
        "on-tertiary": "#233143",
        "primary-fixed-dim": "#c0c1ff",
        "surface-container": "#201f20",
        "primary": "#c0c1ff",
        "on-secondary-fixed-variant": "#004e5a",
        "on-tertiary-fixed-variant": "#39485a",
        "background": "#131314",
        "inverse-on-surface": "#313031",
        "primary-container": "#8083ff",
        "error-container": "#93000a",
        "tertiary": "#b9c8de",
        "error": "#ffb4ab",
        "on-secondary-container": "#00515d",
        "on-surface-variant": "#c7c4d7",
        "on-primary-fixed-variant": "#2f2ebe",
        "on-secondary-fixed": "#001f25",
        "surface-container-high": "#2a2a2b",
        "on-primary": "#1000a9",
        "on-error": "#690005",
        "inverse-primary": "#494bd6",
        "surface-container-highest": "#353436",
        "on-secondary": "#00363e",
        "on-error-container": "#ffdad6",
        "surface-dim": "#131314",
        "secondary-container": "#00cbe6",
        "on-tertiary-fixed": "#0d1c2d",
        "surface-bright": "#3a393a",
        "secondary": "#5de6ff",
        "on-tertiary-container": "#1c2b3c",
        "tertiary-fixed": "#d4e4fa",
        "surface": "#131314",
        "secondary-fixed-dim": "#2fd9f4",
        "on-background": "#e5e2e3",
        "inverse-surface": "#e5e2e3",
        "surface-container-lowest": "#0e0e0f",
        "outline": "#908fa0",
        "surface-container-low": "#1c1b1c",
        "tertiary-fixed-dim": "#b9c8de",
        "surface-tint": "#c0c1ff",
        "secondary-fixed": "#a2eeff",
        "on-surface": "#e5e2e3"
      },
      fontFamily: {
        headline: ["Inter"],
        body: ["Inter"],
        label: ["Inter"],
        mono: ["JetBrains Mono"]
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem"
      }
    }
  }
};

export const tailwindConfigScript = `
tailwind.config = ${JSON.stringify(tailwindConfig)};
`;

export const googleFontsLink = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap";
export const materialSymbolsLink = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap";
export const tailwindCdnScript = "https://cdn.tailwindcss.com?plugins=forms,container-queries";

export const commonHeadLinks = [
  { rel: "stylesheet", href: googleFontsLink },
  { rel: "stylesheet", href: materialSymbolsLink }
];

export const commonHeadScripts = [
  {
    key: "tailwind-cdn",
    props: { src: tailwindCdnScript }
  },
  {
    key: "tailwind-config",
    props: { id: "tailwind-config" },
    script: tailwindConfigScript
  }
];
