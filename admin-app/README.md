# Tiffin & Curry House — Restaurant Console

A restaurant **operations dashboard** for the Indian Tiffin & Curry House. This is the
staff/kitchen side of the business — where incoming orders arrive, get prepared, and are
assigned to a delivery partner or marked for self-pickup.

Built with **React 18 + Vite + React Router** in plain `.jsx`. All data is mock data kept
in the browser (`localStorage`), so it runs fully offline with no backend.

## Features

- **Operations Dashboard** — live KPIs (orders, revenue, active orders, available riders),
  recent orders, new-order queue and kitchen queue.
- **Orders board** — filter by status (new / preparing / ready / out / completed), search,
  and a full order detail panel with a status workflow.
- **Assign delivery / pickup** — assign any order to a delivery partner, or switch it to
  self-pickup, then dispatch.
- **Delivery Partners** — manage riders, vehicles, zones and availability.
- **Menu Management** — add/edit/remove items, set pricing, toggle in-stock / out-of-stock.
- **Customers** — directory with order counts and lifetime spend.
- **Analytics & Reports** — weekly revenue chart, top-selling items, partner leaderboard.
- **Order intake (both)** — simulated incoming orders appear automatically (toggle in the
  sidebar) **and** staff can create orders manually with the "New order" button.

## Run it in VS Code

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal (default http://localhost:5173).

### Build for production

```bash
npm run build
npm run preview
```

## Notes

- Data persists in your browser. Use the **"Live order simulation"** toggle in the sidebar
  to start/stop auto-generated orders.
- To reset everything to the original demo data, clear the site's local storage, or call
  `resetData()` (wired in the store) — easiest is to clear `localStorage` in dev tools.

## Project structure

```
src/
  data/seed.js            mock orders, partners, menu, customers
  context/StoreContext.jsx app state, actions, simulation, persistence
  components/             Modal, shared UI helpers
  pages/                  Dashboard, Orders, Partners, Menu, Customers, Analytics
  App.jsx                 layout, sidebar, routing
  index.css              design system
```

## Staff Login & Roles

The console is protected by a staff login. Sign in with one of the demo
accounts (or click an account on the login screen to sign in instantly):

| Role        | Username   | Password      | Can assign partners & change order status | Manage menu / partners | Cancel orders |
|-------------|------------|---------------|:-----------------------------------------:|:----------------------:|:-------------:|
| Administrator | `admin`    | `admin123`    | ✅ | ✅ | ✅ |
| Manager       | `manager`  | `manager123`  | ✅ | ✅ | ✅ |
| Dispatcher    | `dispatch` | `dispatch123` | ✅ | ❌ | ❌ |

- **Only authorized roles can assign delivery partners and advance order
  statuses.** The fulfilment controls and status buttons are disabled/hidden
  for users without permission.
- The **Delivery Partners** and **Menu** sections are visible only to roles
  with management permission (Admin, Manager).
- Sessions are persisted in `localStorage`. Use **Sign out** in the top bar to
  end the session.

> This is a front-end-only mock authentication for demo purposes. For a real
> deployment, replace it with a secure backend (e.g. Lovable Cloud) that
> validates credentials and enforces roles server-side.
