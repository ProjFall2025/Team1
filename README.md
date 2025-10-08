

\## Target Users (Student 2)

\*\*Attendees (18–35, students/young professionals)\*\*  

Needs: discover events, clear pricing, secure payments, booking history.  

Support: Events (search/filter), Bookings (history), Payments (receipts).



\*\*Organizers (clubs, SMEs, institutions)\*\*  

Needs: create/manage events, track bookings, handle refunds.  

Support: Events (CRUD + organizer\_id), Bookings (per event), Payments (refunds).



\*\*Admins (platform managers)\*\*  

Needs: oversight, moderation, monitoring.  

Support: Users(role='admin'), event approvals (workflow), transaction monitoring.



\## ER Diagram (Student 2)

!\[ER Diagram](docs/erd.png)



\## How the Schema Supports Features (Student 2)

\- ERD shows `Users ↔ Events ↔ Bookings ↔ Payments` flow clearly.  

\- Organizer linkage via `Events.organizer\_id`.  

\- Bookings enforces one booking per user/event with `UNIQUE(user\_id,event\_id)`.  

\- Payments ensure traceability of each booking’s transaction/refund status.

