USE event_management;

-- Sample users (Password for all is 'password123')
-- The hash below is a valid bcrypt hash for "password123"
INSERT INTO users (name, email, password, role) VALUES
('System Admin', 'admin@example.com', '$2b$10$GB.p.f9y4u.g8.P/x.u.6.7.8.9.0.1.2.3.4.5.6.7.8.9.0.1.2', 'admin'),
('John Organizer', 'john@example.com', '$2b$10$GB.p.f9y4u.g8.P/x.u.6.7.8.9.0.1.2.3.4.5.6.7.8.9.0.1.2', 'organizer'),
('Jane Attendee', 'jane@example.com', '$2b$10$GB.p.f9y4u.g8.P/x.u.6.7.8.9.0.1.2.3.4.5.6.7.8.9.0.1.2', 'attendee');

-- Sample events
INSERT INTO events (title, description, date, location, organizer_id) VALUES
('Tech Expo 2025', 'A technology exhibition featuring startups', '2025-12-05', 'Hyderabad', 2),
('Music Fest', 'Outdoor music event', '2025-12-12', 'Goa', 2),
('Art Show', 'Exhibition of modern art', '2025-11-20', 'Bangalore', 2);

-- Sample bookings
INSERT INTO bookings (event_id, user_id, status) VALUES
(1, 3, 'confirmed'), 
(2, 3, 'confirmed'), 
(3, 3, 'confirmed');

-- Sample payments (Linked to user_id now, consistent with schema)
INSERT INTO payments (booking_id, user_id, amount, payment_method, status) VALUES
(1, 3, 500.00, 'stripe', 'completed'),
(2, 3, 750.00, 'stripe', 'pending'),
(3, 3, 1000.00, 'stripe', 'completed');

-- Sample reviews
INSERT INTO reviews (user_id, event_id, rating, comment) VALUES
(3, 1, 5, 'Amazing event!'),
(3, 2, 4, 'Good organization, great music.');