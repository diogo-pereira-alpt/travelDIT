/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,

  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
      fontFamily:{
        'montserrat' : ['Montserrat'],
        'meo-text-extended' : ['"meo-text-extended","MEO Text", "Arial sans-serif"'],
        
      },
      boxShadow:{
        'top': '0 -4px 6px -1px rgba(0,0,0,0.1),0 -2px 4px -1 rgba(0,0,0,0.06)',
        'left':'-4px  0 6px -1px  rgba(0,0,0,0.1), -2px 0  4px -1 rgba(0,0,0,0.06)',
        'right':'4px  0 6px -1px  rgba(0,0,0,0.1), 2px 0  4px -1 rgba(0,0,0,0.06)',
          'custom': '0px 7px 11px 0px rgba(0, 0, 0, 0.03)'
        
      },

      
      colors: {
        "color-black-meo" : "#333333",
        "color-grey-ccc-meo" : "#cccccc",
        "color-blue-meo" : "#0099AB",
        "color-blue-meo-2": "#2e26ff",
        "color-hover-blue" : "#0099AB",
        "color-red-error": "#d6001a",
        "color-blue-altice" : "#0084d6",
        "color-green-altice": "#3AA958",
        "color-light-green-altice": "#74B72B",
        "color-green-meo": "#00AA13",
        "color-light-grey-altice": "#f6f6f6",
        "color-grey-light": "rgba(0, 0, 0, 1)",
        "color-grey-l1": "rgba(51, 51, 51, 1)",
        "color-grey-l2": "rgba(128, 128, 128, 1)",
        "color-grey-l4": "rgba(235, 235, 235, 1)",
        "color-grey-l5": "rgba(246, 246, 246, 1)",
        "color-grey-dark": "rgba(255, 255, 255, 1)",
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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      
    },
  },
  plugins: [require("tailwindcss-animate")],
};
