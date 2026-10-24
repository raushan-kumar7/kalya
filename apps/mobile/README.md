# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **src/app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **example** directory and create a blank **src/app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

import type { Config } from 'tailwindcss';

const config: Config = {
// Support both React Native (NativeWind v4) and Web
content: [
'./App.{js,jsx,ts,tsx}',
'./src/**/\*.{js,jsx,ts,tsx}',
'./apps/**/_.{js,jsx,ts,tsx}',
'./packages/\**/_.{js,jsx,ts,tsx}',
],
presets: [require('nativewind/preset')],
darkMode: 'class',
theme: {
extend: {
colors: {
kalya: {
/* Brand Primitives */
primary: {
DEFAULT: '#0d3e26', // Sovereign Emerald
dark: '#072617', // Vault Night
light: '#1b5e3a', // Forest Green
muted: '#257c4c',
},
gold: {
DEFAULT: '#d4af37', // Radiant Metallic Gold
warm: '#b8912e', // Burnished Deep Gold
soft: '#fdf3cd', // Champagne Gold Shimmer
dark: '#9a741c',
},
mint: {
DEFAULT: '#a3e6be', // Lucid Mint Sage
light: '#edfdf2', // Base Mint Canvas Wash
subtle: '#e1f7ea',
},
canvas: '#edfdf2',

          /* Standard / Solid UI Colors */
          surface: {
            DEFAULT: '#ffffff',
            subtle: '#f4fcf7',
            muted: '#e7f8ec',
            card: '#ffffff',
            raised: '#ffffff',
            dark: '#072617',
          },
          text: {
            primary: '#082919',
            secondary: '#2d5e46',
            tertiary: '#5d8a72',
            accent: '#9a741c',
            inverse: '#ffffff',
          },
          border: {
            subtle: '#cde8d7',
            DEFAULT: '#b2dbc0',
            strong: '#0d3e26',
            accent: '#d4af37',
          },

          /* Financial 50/30/20 & Flow Allocation */
          needs: '#0d3e26',
          wants: '#d4af37',
          savings: '#2d7a50',
          inflow: '#1b8a51',
          outflow: '#c83535',

          /* Liquid UI Refractive & Translucent Glass Tokens */
          glass: {
            'ultra-thin': 'rgba(255, 255, 255, 0.40)',
            base: 'rgba(255, 255, 255, 0.65)',
            thick: 'rgba(255, 255, 255, 0.82)',
            emerald: 'rgba(13, 62, 38, 0.88)',
            'emerald-dark': 'rgba(7, 38, 23, 0.95)',
            gold: 'rgba(212, 175, 55, 0.12)',
            'gold-strong': 'rgba(212, 175, 55, 0.25)',
            border: 'rgba(255, 255, 255, 0.65)',
            'border-emerald': 'rgba(255, 255, 255, 0.18)',
            'border-gold': 'rgba(212, 175, 55, 0.35)',
          },
        },
      },
      fontFamily: {
        outfit: ['Outfit-Regular', 'sans-serif'],
        'outfit-medium': ['Outfit-Medium', 'sans-serif'],
        'outfit-semibold': ['Outfit-SemiBold', 'sans-serif'],
        'outfit-bold': ['Outfit-Bold', 'sans-serif'],
      },
      borderRadius: {
        'kalya-xs': '6px',
        'kalya-sm': '10px',
        'kalya-md': '16px',
        'kalya-lg': '24px',
        'kalya-xl': '32px',
        'kalya-pill': '9999px',
      },
      boxShadow: {
        /* Standard Solid Elevation */
        'kalya-card': '0 2px 8px rgba(13, 62, 38, 0.05)',
        'kalya-elevated': '0 8px 24px rgba(13, 62, 38, 0.08)',
        'kalya-floating': '0 16px 40px rgba(13, 62, 38, 0.12)',

        /* Liquid UI Specular Depth & Glass Glows */
        'liquid-float': '0 14px 34px -8px rgba(13, 62, 38, 0.10), 0 4px 12px -2px rgba(13, 62, 38, 0.04)',
        'liquid-dock': '0 20px 48px -10px rgba(13, 62, 38, 0.18), 0 6px 16px -2px rgba(13, 62, 38, 0.06)',
        'liquid-emerald': '0 22px 50px -12px rgba(7, 38, 23, 0.45)',
        'liquid-inner-specular': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.75)',
        'liquid-inner-dual': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 1px 0 rgba(13, 62, 38, 0.05)',
      },
      backdropBlur: {
        subtle: '12px',
        standard: '20px',
        dense: '32px',
        deep: '48px',
      },
    },

},
plugins: [],
};

export default config;
