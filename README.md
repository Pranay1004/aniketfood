# DHAABA 420 — Backend

This repository adds a simple Node/Express backend for the `index..html` frontend.

Features
- Create orders and persist them to `orders.json`
- Optional Stripe Checkout for card payments (set `STRIPE_SECRET_KEY`)
- Optional WhatsApp confirmation via Twilio (set Twilio env vars)
- Order tracking endpoint and admin status update endpoint

Quick start

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:

```bash
npm install
```

3. Run server:

```bash
npm run dev
```

Endpoints
- `POST /api/orders` — create an order. JSON body expected with `name`, `sc`, `phone`, `items` (array of {name,price,qty}), `paymentMethod` ("upi"|"cash"|"card"), `pickupTime`, `note`, `prog`.
- `GET /api/orders/:id` — retrieve order by id
- `POST /api/orders/:id/status` — update order status (requires `X-Admin-Token` header matching `ADMIN_TOKEN`)

Notes
- The frontend (`index..html`) can be updated to call `/api/orders` and handle responses. For card payments the server will return `checkoutUrl` to redirect the user to Stripe Checkout.
# aniket_food
