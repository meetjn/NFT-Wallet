// import type { Config } from "tailwindcss";

// const config: Config = {
//   content: [
//     "./pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         background: "var(--background)",
//         foreground: "var(--foreground)",
//       },
//     },
//   },
//   plugins: [],
// };
// export default config;




import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
  			'urbanist-black': [
  				'Urbanist-Black',
  				'sans-serif'
  			],
  			'urbanist-bold': [
  				'Urbanist-Bold',
  				'sans-serif'
  			],
  			'urbanist-extrabold': [
  				'Urbanist-ExtraBold',
  				'sans-serif'
  			],
  			'urbanist-extralight': [
  				'Urbanist-ExtraLight',
  				'sans-serif'
  			],
  			'urbanist-light': [
  				'Urbanist-Light',
  				'sans-serif'
  			],
  			'urbanist-medium': [
  				'Urbanist-Medium',
  				'sans-serif'
  			],
  			'urbanist-regular': [
  				'Urbanist-Regular',
  				'sans-serif'
  			],
  			'urbanist-semibold': [
  				'Urbanist-SemiBold',
  				'sans-serif'
  			],
  			'urbanist-thin': [
  				'Urbanist-Thin',
  				'sans-serif'
  			],
  			'digital-7': [
  				'Digital7',
  				'sans-serif'
  			]
  		},
      
    },
  },
  plugins: [],
};

export default config;
