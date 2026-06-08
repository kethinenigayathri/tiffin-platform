# 🍛 Indian Tiffin & Curry House

A React (Vite, **.jsx**) web app for an authentic South Indian vegetarian tiffin & curry house in Dessau-Roßlau, Germany — built from the Tech Build Roadmap. Supports **Parcel · Subscription · Pickup**.

## Features
- 🏠 Landing page with hero + featured dishes
- 🍽️ Full menu with category filters (Tiffin / Curry House / Sides)
- 🛒 Cart drawer with add / remove / quantity
- 📦 Subscription plans (Weekly / Monthly / Family)
- 💳 Checkout flow (parcel/pickup, card/SEPA/cash) — demo only, no real payment
- 🗺️ Build Roadmap page (the 12-phase plan)
- 📱 Fully responsive design

## Tech
- React 18 + Vite
- React Router v6
- Plain CSS design system (no Tailwind/config needed)

## Run it in VSCode
1. Open this folder in VSCode.
2. Install [Node.js](https://nodejs.org) (v18+) if you don't have it.
3. In the terminal:
   ```bash
   npm install
   npm run dev
   ```
4. Open the URL it prints (usually http://localhost:5173).

## Build for production
```bash
npm run build
npm run preview
```

## Project structure
```
src/
  components/   Navbar, CartDrawer, MenuCard, Footer
  context/      CartContext (cart state)
  data/         menu.js, roadmap.js
  pages/        Home, MenuPage, Subscribe, Checkout, Roadmap
  App.jsx, main.jsx, index.css
```

> Note: This is a frontend demo. To add real online payments (Stripe), user
> auth, emails, and tax invoices, follow the phases on the **Build Roadmap** page.
