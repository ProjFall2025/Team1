v## 4) UML & Sequence Diagram (Student 3)

**Sequence Diagram – Login Flow:**
![Sequence – Login](docs/uml-sequence-login.png)

**Explanation:**
1. User enters credentials in React app.
2. React sends a POST request `/api/users/login` with JSON body `{email, password}`.
3. The API validates input, fetches the user from DB, compares the hash via bcrypt.
4. On success, it signs a JWT (with id + role) and returns it.
5. The React app stores the token locally (or in memory) and uses it for subsequent API requests.

---

## 5) API Design (Student 3)

### **Authentication**
| Method | Endpoint | Role | Description |
|--------|-----------|------|-------------|
| POST | `/api/users/register` | Public | Create new user |
| POST | `/api/users/login` | Public | Authenticate user, returns JWT |
| GET | `/api/users/me` | Attendee / Organizer / Admin | Get current user profile |

### **Events**
| Method | Endpoint | Role | Description |
|--------|-----------|------|-------------|
| GET | `/api/events` | Public | List or filter events |
| POST | `/api/events` | Organizer / Admin | Create event |
| PUT | `/api/events/:id` | Organizer / Admin | Edit event |
| DELETE | `/api/events/:id` | Organizer / Admin | Delete event |

### **Bookings**
| Method | Endpoint | Role | Description |
|--------|-----------|------|-------------|
| POST | `/api/bookings` | Attendee | Book ticket for event |
| GET | `/api/bookings/me` | Attendee | View user’s bookings |
| DELETE | `/api/bookings/:id` | Attendee / Admin | Cancel booking |

### **Payments**
| Method | Endpoint | Role | Description |
|--------|-----------|------|-------------|
| POST | `/api/payments/checkout` | Attendee | Start payment process |
| POST | `/api/payments/webhook` | System | Handle payment callbacks (Stripe/PayPal) |

**Request / Response Example**
```json
POST /api/users/login
Request: { "email": "user@example.com", "password": "secret" }
Response: { "token": "jwt_token", "role": "Attendee" }

## 6) Security & Performance (Student 3)

### 🔐 Security Measures

1. **Input Validation:** All POST/PUT routes use `express-validator`.
2. **Password Hashing:** Using bcrypt (12+ salt rounds).
3. **JWT Authentication:** Access tokens short-lived (1 hour); verified in middleware.
4. **Helmet & CORS:** Adds security headers and domain whitelisting.
5. **HTTPS Only:** All deployments enforce secure connections.
6. **Environment Variables:** Secrets (JWT key, DB passwords) stored in `.env`, never committed.

### ⚡ Performance Measures

1. **Database Indexing:** `event_date`, `title`, and foreign keys (`user_id`, `event_id`).
2. **Pagination:** All list endpoints (`/api/events`, `/api/bookings`) use `?page=&limit=`.
3. **Caching (optional):** Common queries cached via Redis or memory store.
4. **Async I/O:** Non-blocking Express + DB pooling.

