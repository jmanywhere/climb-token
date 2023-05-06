import { type Config } from "tailwindcss";
import daisy from "daisyui";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily:{
        mono: [ `var(--font-red-hat-mono)`]
      }
    },
  },
  daisyui:{
    base: false,
    themes:[
      {
        myTheme: {
          "primary": "#6FC1D8",
          "secondary": "#1F4CA8",
          "accent": "#1F4CA8",
          "base-100": "#14161D"
        }
      }
    ]
  },
  plugins: [daisy],
} satisfies Config;
