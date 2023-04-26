import { type Config } from "tailwindcss";
import daisy from "daisyui";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  daisyui:{
    base: false,
    themes:[
      {
        myTheme: {
          "primary": "#5DC7EC",
          "accent": "#623C60",
          "base-100": "#14161D"
        }
      }
    ]
  },
  plugins: [daisy],
} satisfies Config;
