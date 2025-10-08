---



\## Target Users (Student 2)

\*\*Attendees (18–35, students/young professionals)\*\*  

\*\*Needs:\*\* Discover events, view clear pricing, make secure payments, and check booking history.  

\*\*Support:\*\* Events (search/filter), Bookings (history), Payments (receipts).



\*\*Organizers (clubs, SMEs, institutions)\*\*  

\*\*Needs:\*\* Create and manage events, track bookings, and handle refunds.  

\*\*Support:\*\* Events (CRUD + organizer\_id), Bookings (per event), Payments (refunds).



\*\*Admins (platform managers)\*\*  

\*\*Needs:\*\* Oversight, moderation, and transaction monitoring.  

\*\*Support:\*\* Users (role='admin'), event approvals (workflow), and payment monitoring.



---



\## ER Diagram (Student 2)

!\[ER Diagram](docs/erdiagram.png)



---



\## How the Schema Supports Features (Student 2)

\- The ER Diagram clearly shows the relationship among \*\*Users ↔ Events ↔ Bookings ↔ Payments\*\*.  

\- \*\*Organizer linkage\*\* is established through `Events.organizer\_id`.  

\- \*\*Bookings\*\* enforce one booking per user/event using the unique constraint `UNIQUE(user\_id, event\_id)`.  

\- \*\*Payments\*\* ensure traceability of every booking’s transaction and refund status, maintaining system reliability and auditability.



