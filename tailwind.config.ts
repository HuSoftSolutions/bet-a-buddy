import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
				primary: {
          light: '#4ade80',  
          DEFAULT: '#16a34a',
          dark: '#14532d',
        },
      },
			animation: {
        'wave-gradient': 'wave 7s infinite linear',
      },
      keyframes: {
        wave: {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
      },
      backgroundSize: {
        'size-200': '200% 200%',
      },
			// fontSize: {
      //   xs: '20px',    // Custom value for xs
      //   sm: '25px',   // Custom value for sm
      //   base: '60px',     // Default size (base)
      //   lg: '100px',   // Custom value for lg
      //   xl: '2rem',    // Custom value for xl
      //   '2xl': '1.5rem',  // Custom value for 2xl
      //   '3xl': '1.875rem', // Custom value for 3xl
      //   '4xl': '2.25rem', // Custom value for 4xl
      //   '5xl': '3rem',    // Custom value for 5xl
      // },
    },
  },
  plugins: [],
} satisfies Config;

/*
 
BLUE:
          light: '#2563eb',  
          DEFAULT: '#1d4ed8',
          dark: '#1e3a8a',

GREEN:
          light: '#4ade80',  
          DEFAULT: '#16a34a',
          dark: '#14532d',

*/
