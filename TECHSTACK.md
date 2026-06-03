# Cineverse Tech Stack

A comprehensive overview of all technologies used in the Cineverse Frontend PWA application.

## 🏗️ Core Framework

### React
- **Version:** 18.2.0
- **Type:** Frontend Framework
- **Purpose:** UI library for building interactive user interfaces with component-based architecture
- **Docs:** https://react.dev

### React DOM
- **Version:** 18.2.0
- **Type:** React Rendering Library
- **Purpose:** Renders React components to the DOM

---

## 🔨 Build & Development Tools

### Vite
- **Version:** 5.0.0
- **Type:** Build Tool & Development Server
- **Purpose:** Fast build tool and development server with Hot Module Replacement (HMR)
- **Key Features:**
  - Lightning-fast dev startup
  - Instant HMR
  - Optimized production builds
- **Docs:** https://vitejs.dev

### @vitejs/plugin-react
- **Version:** 4.2.0
- **Type:** Vite Plugin
- **Purpose:** Enables Fast Refresh and JSX transformation for React development
- **Docs:** https://github.com/vitejs/vite-plugin-react

---

## 🎨 Styling

### Tailwind CSS
- **Version:** 4.3.0
- **Type:** Utility-First CSS Framework
- **Purpose:** Rapid UI development with pre-defined utility classes
- **Key Features:**
  - Responsive design utilities
  - Custom color theme (Cineverse red & dark theme)
  - Dark mode support
- **Docs:** https://tailwindcss.com

### PostCSS
- **Version:** 8.5.15
- **Type:** CSS Processor
- **Purpose:** Transforms CSS with JavaScript plugins
- **Used For:** Processing Tailwind CSS directives

### Autoprefixer
- **Version:** 10.5.0
- **Type:** PostCSS Plugin
- **Purpose:** Automatically adds vendor prefixes for CSS compatibility across browsers
- **Docs:** https://github.com/postcss/autoprefixer

---

## 📱 Progressive Web App (PWA)

### vite-plugin-pwa
- **Version:** latest
- **Type:** Vite Plugin
- **Purpose:** Generates PWA manifest and service worker for offline functionality
- **Key Features:**
  - Service worker generation
  - Web app manifest
  - Offline support
  - App installation capability
- **Docs:** https://vite-plugin-pwa.netlify.app

---

## 📝 Language & Type Safety

### TypeScript
- **Version:** 5.0.0
- **Type:** Programming Language
- **Purpose:** Adds static type checking to JavaScript
- **Benefits:**
  - Type safety
  - Better IDE support
  - Improved code documentation
  - Early error detection
- **Docs:** https://www.typescriptlang.org

### @types/react
- **Version:** 18.2.0
- **Type:** TypeScript Type Definitions
- **Purpose:** Provides TypeScript type definitions for React

### @types/react-dom
- **Version:** 18.2.0
- **Type:** TypeScript Type Definitions
- **Purpose:** Provides TypeScript type definitions for React DOM

---

## 📦 Project Structure

```
cineverse-frontend-pwa/
├── src/
│   ├── pages/
│   │   └── LandingPage.tsx
│   ├── styles/
│   │   └── LandingPage.css
│   ├── offline/
│   │   └── OfflinePage.tsx
│   ├── pwa/
│   │   └── registerSW.ts
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
├── public/
│   └── manifest.webmanifest
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── package.json
```

---

## 🚀 Scripts

```bash
npm run dev    # Start development server with HMR
npm run build  # Build for production
```

---

## 💾 Dependencies Summary

| Package | Version | Type | Purpose |
|---------|---------|------|---------|
| react | 18.2.0 | Dependency | UI Framework |
| react-dom | 18.2.0 | Dependency | React Rendering |
| vite | 5.0.0 | DevDependency | Build Tool |
| @vitejs/plugin-react | 4.2.0 | DevDependency | React Plugin for Vite |
| typescript | 5.0.0 | DevDependency | Type Safety |
| tailwindcss | 4.3.0 | DevDependency | CSS Framework |
| postcss | 8.5.15 | DevDependency | CSS Processor |
| autoprefixer | 10.5.0 | DevDependency | CSS Vendor Prefixes |
| vite-plugin-pwa | latest | DevDependency | PWA Support |
| @types/react | 18.2.0 | DevDependency | React Types |
| @types/react-dom | 18.2.0 | DevDependency | React DOM Types |

---

## 🎯 Key Features Enabled by Tech Stack

✅ **Fast Development** - Vite's HMR for instant updates  
✅ **Type Safety** - TypeScript for error prevention  
✅ **Modern UI** - React component-based architecture  
✅ **Responsive Design** - Tailwind CSS utilities  
✅ **Offline Support** - PWA with service workers  
✅ **Production Ready** - Optimized builds and TypeScript compilation  
✅ **Browser Compatible** - Autoprefixer for cross-browser support  

---

## 🔗 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [MDN Web Docs](https://developer.mozilla.org)

---

**Last Updated:** June 2026
