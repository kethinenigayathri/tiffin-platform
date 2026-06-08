# 🍛 Tiffin & Curry House — Connected Platform

A full-stack food ordering platform made of **three connected apps** that talk to
each other in real time:

| App | Folder | Dev URL | Who uses it |
|-----|--------|---------|-------------|
| **Customer app** | `customer-app/` | http://localhost:5173 | Customers browse the menu, order, and track delivery live |
| **Restaurant console** | `admin-app/` | http://localhost:5174 | Staff receive orders, assign delivery/pickup, update status |
| **Backend API** | `server/` | http://localhost:4000 | Node + SQLite + Socket.IO connecting both apps |

When a customer places an order, the restaurant console receives it **instantly**.
When staff move the order through *Preparing → Ready → Out for delivery → Completed*,
the customer sees the new status **live** — true two-way sync over WebSockets.

---

## ✅ Requirements

- **Node.js 18 or newer** (includes `npm`). Check with `node -v`.

That's it — the database is **SQLite** (a single file, `server/data.sqlite`),
created automatically on first run. No database server to install.

---

## 🚀 Run it (3 steps)

From the project root (`tiffin-platform/`):

```bash
# 1. Install everything (server + both apps) in one go
npm install

# 2. Start the backend AND both front-end apps together
npm run dev
```

This launches:
- API on **http://localhost:4000**
- Customer app on **http://localhost:5173**
- Restaurant console on **http://localhost:5174**

The customer app and console open in your browser automatically.

> Prefer separate terminals? Run `npm run dev:server`, `npm run dev:customer`,
> and `npm run dev:admin` individually.

---

## 🔑 Demo logins

**Customer app** (http://localhost:5173 → "Sign in")
- Email: `demo@tiffin.com`
- Password: `demo123`
- …or register a brand new customer account.

**Restaurant console** (http://localhost:5174)
| Role | Username | Password | Can do |
|------|----------|----------|--------|
| Administrator | `admin` | `admin123` | Everything |
| Manager | `manager` | `manager123` | Orders, menu, partners |
| Dispatcher | `dispatch` | `dispatch123` | Orders + assign delivery only |

---

## 🔁 Try the live two-way sync

1. Open the **customer app** (5173), sign in, add dishes, and place an order.
2. Open the **restaurant console** (5174) in another tab and sign in as `admin`.
   → The new order pops in instantly with a "New order received" toast.
3. In the console, open the order and **Advance** its status / assign a partner.
4. Back in the customer app, go to **My Orders** — the status updates live. 🎉

---

## 🗂️ Project structure

```
tiffin-platform/
├── package.json          # workspaces + "npm run dev" runs all three
├── server/               # Node + Express + SQLite + Socket.IO
│   ├── src/
│   │   ├── index.js      # server entry (REST + WebSockets)
│   │   ├── db.js         # SQLite schema + seed data
│   │   ├── auth.js       # JWT + role permissions
│   │   └── routes/       # menu, orders, partners, customers, auth
│   └── .env.example      # PORT / JWT secret / allowed origins
├── customer-app/         # React (.jsx) storefront
└── admin-app/            # React (.jsx) restaurant console
```

### Configuration (optional)
- **Backend**: copy `server/.env.example` to `server/.env` to change the port,
  JWT secret, or allowed origins. Sensible defaults work out of the box.
- **Front-end**: each app reads `VITE_API_URL` (defaults to
  `http://localhost:4000`). Copy `.env.example` to `.env` in either app to point
  at a different backend.

---

## 🧱 How they connect

- **Separate logins**: customers and staff have independent accounts and JWT
  tokens (`/api/customer/auth/*` and `/api/staff/auth/*`).
- **REST** for actions (place order, change status, manage menu/partners).
- **Socket.IO rooms** for live updates:
  - Staff join a `staff` room → receive every new order + update.
  - Each customer joins their own room → receives updates only for their orders.
- **Roles & permissions** are enforced on the backend, not just hidden in the UI.

---

## 📦 Production build

```bash
npm run build      # builds both front-end apps into their dist/ folders
npm start          # runs the backend API only
```

Serve the built `customer-app/dist` and `admin-app/dist` with any static host,
and run the backend with `npm start`. Remember to set `CLIENT_ORIGINS` in
`server/.env` to your deployed front-end URLs.
