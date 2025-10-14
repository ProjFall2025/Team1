# System Design – Eventuraa (Event Management System)

**Team:** Shashi Preetham Goud Palle • Lakshmi Pravallika Chavvakula • Phanindra Nagu  
**Due:** Oct 18, 2025 • **Style:** 3-Tier (React SPA ↔ Node/Express API ↔ MySQL/PostgreSQL)

---

## 1) System Architecture Overview (Student 1)

**Architecture Style:** 3-Tier (Client / API / DB)

- **Front-end (React SPA):** UI, routing, forms, Axios for API calls, token storage (access token).
- **Back-end (Node.js + Express):** REST API, auth, RBAC middleware, validation, business logic.
- **Database (MySQL/PostgreSQL):** Users, Events, Bookings, Payments (from Part 2).
- **3rd-Party APIs:** Stripe/PayPal (payments), Google OAuth (social login), Maps (optional).
- **Data Flow:** React → Axios → Express routes → Services → DB → JSON response → React.

**Diagram:**
![Architecture](docs/architecture.png)

---

## 2) Technology Stack (Student 1)

- **Front-end:** React 18, React Router, Axios; (optional) Redux Toolkit for global state.
- **Back-end:** Node 20, Express 4, bcrypt, jsonwebtoken, express-validator, cors, helmet, morgan.
- **Database:** MySQL 8 (mysql2) *or* PostgreSQL 15 (pg).
- **Authentication:** JWT access tokens (1h), optional refresh tokens (httpOnly cookie), optional Google OAuth via Passport.js.
- **Testing:** Jest, Supertest (API), React Testing Library.
- **DevOps/Deploy:** Docker (multi-stage), AWS (EC2/RDS) or Render/Vercel/Netlify.
- **Observability:** morgan (HTTP logs), winston (app logs).

