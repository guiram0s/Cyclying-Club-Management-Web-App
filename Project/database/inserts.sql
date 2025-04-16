-- Insert sample event types
INSERT INTO event_types (description) VALUES
('Race'),
('Tour'),
('Training Session');

-- Insert sample members
INSERT INTO members (name) VALUES
('John Doe'),
('Jane Smith'),
('Alice Brown');

-- Insert member preferred event types (associating members with event types)
INSERT INTO member_preferred_event_types (member_id, event_type_id) VALUES
(1, 1), -- John prefers Race
(1, 3), -- John prefers Training Session
(2, 2), -- Jane prefers Tour
(3, 1); -- Alice prefers Race

-- Insert sample events
INSERT INTO events (description, type_id, date) VALUES
('City Marathon', 1, '2025-03-01'),
('Mountain Tour', 2, '2025-04-15'),
('Morning Training', 3, '2025-02-25');

-- Insert members enrolled in events
INSERT INTO member_enrolled_events (member_id, event_id) VALUES
(1, 1), -- John enrolled in City Marathon
(1, 3), -- John enrolled in Morning Training
(2, 2), -- Jane enrolled in Mountain Tour
(3, 1); -- Alice enrolled in City Marathon