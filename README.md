# Inventory Management System (FIFO) — Real-Time Ingestion & Live Dashboard

A full-stack inventory management tool for a small trading business, using **FIFO (First-In-First-Out)** costing. Inventory events (purchases and sales) are ingested in real time via **Apache Kafka** (Redpanda Cloud), processed by a Node.js backend, and visualized on a live React dashboard.

## Live Links

- **Frontend:** https://inventory-management-system-pi-ruddy.vercel.app
- **Backend API:** https://inventory-backend-86ri.onrender.com
- **Login credentials:** see submission notes / provided separately

> Note: the backend is hosted on Render's free tier, so the first request after a period of inactivity may take ~30-60 seconds to respond while the server spins up.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (hosted on Neon)
- **Messaging:** Apache Kafka via Redpanda Cloud (Kafka-API compatible)
- **Frontend:** React (Vite) + Tailwind CSS
- **Auth:** JWT + bcrypt
- **Deployment:** Render (backend + Kafka consumer), Vercel (frontend)

## FIFO Logic — How It Works

Every **purchase** event creates a new inventory batch with its own quantity, unit price, and timestamp. Every **sale** event consumes stock from the **oldest available batches first** — this is what "FIFO" means in practice.

When a sale comes in for, say, 50 units, and there are two batches available — 30 units at ₹100 and 40 units at ₹120 — the system takes all 30 from the older, cheaper batch and 20 from the next one:

```
Cost = (30 × ₹100) + (20 × ₹120) = ₹3000 + ₹2400 = ₹5400
```

This mirrors how a real trading business accounts for cost of goods sold — older, and often cheaper, stock is depleted before newer stock.

**Implementation details:**
- Each sale runs inside a database transaction with row-level locking (`SELECT ... FOR UPDATE`) on the batches being consumed, to prevent two concurrent sales from over-selling the same stock.
- If there isn't enough stock across all batches to fulfill a sale, the transaction is rolled back and the event is rejected — inventory can never go negative.
- A partial index on `inventory_batches (product_id, purchase_timestamp)` — filtered to batches with remaining stock — keeps the "find the oldest available batch" lookup fast as the dataset grows.

## Database Schema

- **`products`** — master list of product IDs.
- **`inventory_batches`** — one row per purchase, tracking both the original quantity and the remaining (unconsumed) quantity.
- **`sales`** — one row per sale, with the FIFO-computed `total_cost`.
- **`users`** — login credentials (bcrypt-hashed passwords).

## API Endpoints

| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| GET | `/health` | Health check | No |
| POST | `/auth/register` | Create a login (not required by spec, added for convenience) | No |
| POST | `/auth/login` | Log in, returns a JWT | No |
| GET | `/products` | Stock overview — quantity, total cost, avg cost/unit per product | Yes |
| GET | `/ledger` | Combined purchase + sale history, chronological | Yes |
| POST | `/simulate` | Publishes one random purchase/sale event to Kafka | Yes |
| POST | `/reset` | Clears transactional data (keeps login intact) | Yes |

Protected routes expect an `Authorization: Bearer <token>` header.

## Kafka Event Format

Events are published to the `inventory-events` topic:

```json
{
  "product_id": "PRD001",
  "event_type": "purchase",
  "quantity": 50,
  "unit_price": 100.0,
  "timestamp": "2025-07-12T10:00:00Z"
}
```

For `"sale"` events, `unit_price` is omitted — the cost is computed server-side using FIFO, not supplied by the event.

## Running Locally

### Prerequisites
- Node.js 18+
- A PostgreSQL database (e.g. a free Neon project)
- A Kafka-compatible broker (e.g. a free Redpanda Cloud Serverless cluster) with a topic named `inventory-events`

### Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```
DATABASE_URL=<your Postgres connection string>
KAFKA_BROKER=<your Kafka broker URL>
KAFKA_USERNAME=<your SASL username>
KAFKA_PASSWORD=<your SASL password>
JWT_SECRET=<any random secret string>
PORT=3000
```

Create the database tables:

```bash
node db/runSchema.js
```

Create a login user:

```bash
node db/createUser.js
```

Start the server (this also starts the Kafka consumer in the same process):

```bash
npm run dev
```

### Running the Kafka producer/simulator locally

With the backend running (so the consumer is listening), publish a batch of dummy purchase/sale events:

```bash
cd backend
node kafka/simulator.js
```

This sends 5 sample events (purchases and sales across two products) to the `inventory-events` topic. Watch the server logs to see each event being consumed and processed through the FIFO logic.

Alternatively, once logged into the dashboard, the **"Simulate Transaction"** button triggers the same pipeline one event at a time via `POST /simulate`.

### Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```
VITE_API_URL=http://localhost:3000
```

Start the dev server:

```bash
npm run dev
```

## Project Structure

```
inventory-management-system/
├── backend/
│   ├── db/            # DB connection, schema, setup scripts
│   ├── services/       # FIFO business logic
│   ├── kafka/          # Kafka client, consumer, simulator (producer)
│   ├── controllers/    # Route handler logic
│   ├── routes/         # Express routes
│   ├── middleware/     # JWT auth middleware
│   └── index.js         # App entrypoint (starts server + Kafka consumer)
└── frontend/
    └── src/
        ├── pages/       # Login, Dashboard
        ├── components/  # StockOverview, TransactionLedger, SimulateButton
        └── api/          # Backend API client
```

## Notes on Deployment

The backend and the Kafka consumer run as a single process on Render's free web service tier (Render's background worker tier is not free), so `index.js` starts the Express server and the Kafka consumer together on boot. In a production setting with dedicated infrastructure budget, these would typically run as separate services for independent scaling and fault isolation.
