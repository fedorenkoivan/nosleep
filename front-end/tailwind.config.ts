/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                accent: {
                    DEFAULT: "#C59DFF",
                    hover: "#B080FF",
                    subtle: "rgba(197, 157, 255, 0.08)",
                    border: "rgba(197, 157, 255, 0.25)",
                },
                surface: {
                    DEFAULT: "#0F0F0F",
                    elevated: "#141414",
                },
                dark: {
                    bg: "#000000",
                    border: "#222222",
                    text: {
                        primary: "#FFFFFF",
                        secondary: "#888888",
                        tertiary: "#555555",
                    },
                },
            },
            fontFamily: {
                mono: [
                    "ui-monospace",
                    "SFMono-Regular",
                    "Menlo",
                    "Monaco",
                    "Consolas",
                    "Liberation Mono",
                    "Courier New",
                    "monospace",
                ],
            },
        },
    },
    plugins: [],
};
