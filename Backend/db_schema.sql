-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user'
);

-- Create Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INT,
    fullName VARCHAR(255),
    phone VARCHAR(20),
    guests INT,
    date DATE,
    notes TEXT,
    hallName VARCHAR(255),
    price DECIMAL(10, 2),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    message TEXT
);
