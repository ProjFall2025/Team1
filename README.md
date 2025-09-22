# 🎉 Event Management System

## 👥 Team Members
- Student 1: Shashi Preetham Goud Palle
- Student 2: Lakshmi Pravallika Chavvakula
- Student 3: Phanindra Nagu

---

## 1. Website Conceptualization
### Mission Statement

The mission of the **Event Management System** is to create a unified platform where students, professionals, and organizations can seamlessly connect through events. Our goal is to simplify the process of **discovering, booking, and managing events** by offering a digital hub that prioritizes convenience, security, and accessibility.  

This platform is designed to bridge the gap between **event organizers and attendees**. For attendees, it ensures effortless access to a wide variety of events, ranging from academic workshops to concerts and networking meetups. For organizers, it provides the tools necessary to manage registrations, handle payments, and monitor event performance.  

Ultimately, the mission is to foster a vibrant ecosystem where people can **discover opportunities, build communities, and share experiences**. By combining event discovery, secure bookings, and payment integration into one system, our platform ensures that both users and organizers save time, reduce complexity, and maximize participation.  

---

## 2. Target Users

Our platform is designed to support three major user groups. Each group has distinct demographics, needs, and expectations.  

### 2.1 Attendees (Students & Young Professionals)  
- **Demographics & Interests:**  
  Primarily between 18–35 years old, tech-savvy, socially active, and interested in workshops, cultural programs, career fairs, concerts, and community events.  
- **Needs:**  
  Easy event discovery, transparent ticket pricing, secure payment options, booking history, and reminders for upcoming events.  
- **How the Website Helps:**  
  - Provides advanced search and filtering to quickly find relevant events.  
  - Offers a personalized dashboard to manage bookings and payments.  
  - Ensures secure checkout through trusted payment gateways like Stripe/PayPal.  

### 2.2 Organizers (Clubs, Businesses, Institutions)  
- **Demographics & Interests:**  
  Student organizations, small-to-medium businesses, cultural associations, and local event planners.  
- **Needs:**  
  Tools to create events, manage registrations, handle payments and cancellations, and gather event insights.  
- **How the Website Helps:**  
  - Event creation and management dashboard.  
  - Analytics tools for tracking attendance and revenue.  
  - Automated refund management in case of cancellations.  

### 2.3 Administrators (Platform Managers)  
- **Demographics & Interests:**  
  Internal staff maintaining the platform, ensuring content quality, handling disputes, and monitoring security.  
- **Needs:**  
  Oversight tools, ability to moderate events, manage users, detect fraud, and ensure system reliability.  
- **How the Website Helps:**  
  - Admin panel for reviewing and approving events.  
  - Tools for suspending/flagging problematic accounts.  
  - Transaction monitoring to ensure compliance and safety.  

## 3. Main Functionalities

The Event Management System will include the following EPIC-level features. These functionalities directly align with our mission to simplify event discovery and management for all stakeholders.

1. **User Authentication (JWT)**  
   - Secure registration and login using encrypted credentials.  
   - Supports role-based access for attendees, organizers, and admins.  

2. **Event Creation & Management**  
   - Organizers can add, edit, and delete events.  
   - Includes fields for event title, description, date, location, and pricing.  

3. **Event Discovery (Search & Filter)**  
   - Attendees can search events by category, date, or location.  
   - Ensures users quickly find relevant events.  

4. **Ticket Booking**  
   - Real-time ticket availability and booking confirmation.  
   - Prevents overbooking by syncing with database.  

5. **Payments Integration (Stripe/PayPal Sandbox)**  
   - Secure online payment processing.  
   - Automatic receipt generation and booking confirmation.  

6. **Booking History Dashboard**  
   - Attendees can track past and upcoming events.  
   - Helps users stay organized and avoid missed events.  

7. **Cancellations & Refunds**  
   - Users can cancel bookings and receive timely refunds.  
   - Organizers can manage cancellations systematically.  

8. **Admin Controls**  
   - Admin panel for reviewing events, banning spam users, and handling disputes.  
   - Ensures platform remains safe and trustworthy.

---

## 4. Preliminary Development Plan

To ensure a structured build, development will follow a five-phase plan:

### Phase 1 – Research & Analysis  
- Conduct a competitor study (Eventbrite, Meetup) to identify gaps.  
- Gather user requirements through surveys and focus groups.  
- Define functional and non-functional requirements clearly.

### Phase 2 – Design (UI/UX)  
- Create wireframes for attendee and organizer dashboards.  
- Ensure mobile-first, responsive design.  
- Apply accessibility standards (WCAG compliance).  
- Color theme: **Orange, Black, and White** for modern and energetic feel.

### Phase 3 – Development  
- **Backend:** Node.js with Express.js.  
- **Database:** MySQL for structured storage of users, events, bookings, and payments.  
- **Frontend:** React.js with Axios for API calls.  
- **Authentication:** JWT with bcrypt for secure login.  
- **Payments:** Stripe/PayPal sandbox integration.  
- **Version Control:** GitHub with feature-branch workflow.

### Phase 4 – Testing  
- **Unit Testing:** Jest for backend routes.  
- **API Testing:** Postman for endpoint verification.  
- **Frontend Testing:** React Testing Library for UI validation.  
- **Usability Testing:** Small group of student users.  
- **Performance & Security:** Load testing, SQL injection prevention, and XSS protection.

### Phase 5 – Launch & Maintenance  
- **Deployment:** Backend on AWS (EC2 or Elastic Beanstalk), frontend on Vercel/Netlify.  
- **Monitoring:** Logging and uptime monitoring tools.  
- **Maintenance:** Regular bug fixes, feature updates, and security patches.

