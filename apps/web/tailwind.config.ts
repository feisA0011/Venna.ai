import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        ink: "#121212",
        mist: "#f5f5f5"
      }
    }
  },
  plugins: []
};

export default config;
