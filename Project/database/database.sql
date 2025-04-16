-- Create the database
CREATE DATABASE IF NOT EXISTS cycling_club;
USE cycling_club;

-- Table: event_types
CREATE TABLE IF NOT EXISTS event_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL
);

-- Table: events
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    type_id INT NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (type_id) REFERENCES event_types(id) ON DELETE CASCADE
);

-- Table: members
CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Table: member_preferred_event_types
CREATE TABLE IF NOT EXISTS member_preferred_event_types (
    member_id INT NOT NULL,
    event_type_id INT NOT NULL,
    PRIMARY KEY (member_id, event_type_id),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE
);

-- Table: member_enrolled_events
CREATE TABLE IF NOT EXISTS member_enrolled_events (
    member_id INT NOT NULL,
    event_id INT NOT NULL,
    PRIMARY KEY (member_id, event_id),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);