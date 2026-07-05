/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14181F",      // board / admin background
        paper: "#F7F5F0",    // passenger page background
        amber: "#E8A33D",    // split-flap signal accent
        signal: "#3F7A5C",   // on-time / success
        alert: "#B4432D",    // delay / danger
        slate: {
          DEFAULT: "#5B6472",
          light: "#9099A6"
        }
      },
      fontFamily: {
        display: ["'Space Grotesk'", "'Archivo Narrow'", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["'IBM Plex Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
        board: ["'JetBrains Mono'", "ui-monospace", "'SF Mono'", "monospace"]
      },
      letterSpacing: {
        board: "0.08em"
      }
    }
  },
  plugins: []
};
