# Database Design – Event Management System [eventuraa]

**Team:** Shashi Preetham Goud Palle, lakshmi Pravallika chavvakula, Phanindra nagu  

---

## 1) Website Functionalities → Data Mapping (Student 1)
| # | Feature | Data / Entities | Why / Relationships |
|---|---|---|---|
| 1 | User Authentication (JWT) | Users(email, password_hash, role) | `email` UNIQUE; role drives permissions |
| 2 | Event Creation & Mgmt | Events, Users | `Events.organizer_id → Users.user_id` (1:M) |
| 3 | Event Discovery | Events(title, event_date, location, price) | Index on date/title/location |
| 4 | Ticket Booking | Bookings, Users, Events | M:N via Bookings (`user_id`, `event_id`) |
| 5 | Payments | Payments, Bookings | 1:1 (`Payments.booking_id → Bookings`) |
| 6 | Booking History | Bookings | Filter by `Bookings.user_id` |
| 7 | Cancellations & Refunds | Bookings.status, Payments.status | Cancel → refund |
| 8 | Admin Controls | Users(role='admin') | Admin moderates users/events |

---

## 2) Entities & Attributes (Student 1)
**Users** – `user_id (PK, INT AI)`, `name VARCHAR(100)`, `email VARCHAR(150) UNIQUE NOT NULL`, `password_hash VARCHAR(255) NOT NULL`, `role ENUM('attendee','organizer','admin') DEFAULT 'attendee'`, `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`

**Events** – `event_id (PK, INT AI)`, `organizer_id (FK→Users.user_id)`, `title VARCHAR(200) NOT NULL`, `description TEXT`, `event_date DATETIME NOT NULL`, `venue VARCHAR(200)`, `price DECIMAL(10,2)`, `created_at TIMESTAMP`

**Bookings** – `booking_id (PK, INT AI)`, `user_id (FK→Users.user_id)`, `event_id (FK→Events.event_id)`, `status ENUM('confirmed','cancelled') DEFAULT 'confirmed'`, `booked_at TIMESTAMP`, `UNIQUE(user_id, event_id)`

**Payments** – `payment_id (PK, INT AI)`, `booking_id (FK→Bookings.booking_id, UNIQUE)`, `amount DECIMAL(10,2)`, `status ENUM('pending','completed','refunded')`, `payment_date TIMESTAMP`

---

## 3) UML Diagram (Use Case) – (Student 1)
Actors: Attendee, Organizer, Admin  
Use Cases: Register/Login, Browse Events, Book Event, Make Payment, Cancel Booking, Create/Manage Event, Approve Events, Manage Users  
Includes: Book Event «include» Make Payment

![UML Use Case](docs/uml-use-case.png)

---

## 4) ER Diagram (Student 2 adds image here)
*(Student 2 will embed `docs/erd.png`)*

---

## 5) Database Schema (SQL DDL) (Student 3)
*(Student 3 pastes SQL here)*

---

## 6) How the Schema Supports Features (Team)
- Users → roles enable attendee/organizer/admin flows.  
- Events → tied to organizer_id; discoverable via indexed fields.  
- Bookings → resolves M:N between users and events; history by user.  
- Payments → linked 1:1 with bookings for transactions/refunds.

