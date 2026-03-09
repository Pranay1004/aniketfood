const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4242;
const DATA_FILE = path.join(__dirname, 'orders.json');
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

function readOrders() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function writeOrders(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function genOrderId() {
  return 'DH-' + Math.floor(1000 + Math.random() * 9000);
}

// Serve main site (index..html is at repo root)
app.use(express.static(path.join(__dirname)));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const { name, sc, phone, items, total, paymentMethod = 'upi', pickupTime = '', note = '', prog = '' } = req.body;
    if (!name || !sc || !phone || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields: name, sc, phone, items' });
    }

    const orderId = genOrderId();
    const order = {
      id: orderId,
      name, sc, phone, prog,
      items,
      total: Number(total || items.reduce((s,i)=>s + (i.price||0) * (i.qty||1),0)),
      payment: { method: paymentMethod, status: paymentMethod === 'card' ? 'pending' : 'unpaid' },
      pickupTime,
      note,
      status: 'received',
      createdAt: new Date().toISOString()
    };

    const orders = readOrders();
    orders.push(order);
    writeOrders(orders);

    // If card payment requested and Stripe configured, create a Checkout Session
    if (paymentMethod === 'card' && stripe) {
      const line_items = items.map(it => ({
        price_data: {
          currency: 'inr',
          product_data: { name: it.name },
          unit_amount: Math.round((it.price || 0) * 100)
        },
        quantity: it.qty || 1
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items,
        metadata: { orderId },
        success_url: `${BASE_URL}/public/success.html?orderId=${orderId}`,
        cancel_url: `${BASE_URL}/public/cancel.html?orderId=${orderId}`
      });

      return res.json({ ok: true, orderId, checkoutUrl: session.url });
    }

    // Prepare WhatsApp link for confirmation (front-end can open it)
    const itemsTxt = items.map(i => `${i.name} x${i.qty || 1} = ₹${(i.price || 0) * (i.qty || 1)}`).join('\n');
    const msg = encodeURIComponent(
      `🌶️ *NEW ORDER — DHAABA 420*\n\n*Order ID:* ${orderId}\n*Name:* ${name}\n*SC Code:* ${sc}\n*Programme:* ${prog}\n*Phone:* ${phone}\n\n*Items:*\n${itemsTxt}\n\n*Total: ₹${order.total}*\n*Payment:* ${paymentMethod}\n*Pickup Time:* ${pickupTime}\n${note ? `*Note:* ${note}\n` : ''}\n\nKindly confirm this order! 🙏`
    );

    // Optional: send via Twilio WhatsApp if configured
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM) {
      try {
        const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        const sendTo = process.env.TWILIO_WHATSAPP_TO || phone.replace(/[^0-9]/g,'');
        // ensure international format for Twilio (e.g. +91...)
        const toNumber = sendTo.startsWith('+') ? sendTo : `+${sendTo}`;
        await client.messages.create({ from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`, to: `whatsapp:${toNumber}`, body: decodeURIComponent(msg) });
        return res.json({ ok: true, orderId, whatsapp: 'sent' });
      } catch (twErr) {
        console.error('Twilio error', twErr);
        // fall through to return wa.me link
      }
    }

    // Default: return wa.me link so front-end can open for user confirmation
    const waLink = `https://wa.me/${process.env.DEFAULT_WHATSAPP_NUMBER || '919999999999'}?text=${msg}`;
    return res.json({ ok: true, orderId, whatsappLink: waLink });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// Get order by id
app.get('/api/orders/:id', (req, res) => {
  const id = req.params.id;
  const orders = readOrders();
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'not_found' });
  res.json({ ok: true, order });
});

// Admin update status (protected by ADMIN_TOKEN env)
app.post('/api/orders/:id/status', (req, res) => {
  const token = req.headers['x-admin-token'];
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) return res.status(401).json({ error: 'unauthorized' });
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'missing_status' });
  const id = req.params.id;
  const orders = readOrders();
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not_found' });
  orders[idx].status = status;
  writeOrders(orders);
  res.json({ ok: true, order: orders[idx] });
});

// Serve root explicitly to work with `index..html` filename
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index..html'));
});

app.listen(PORT, () => {
  console.log(`DHAABA420 backend listening on ${PORT} (BASE_URL=${BASE_URL})`);
});
