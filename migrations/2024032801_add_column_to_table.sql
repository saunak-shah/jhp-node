CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    version INTEGER UNIQUE NOT NULL
);
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    org_id INTEGER,
    fname VARCHAR(50),
    lname VARCHAR(50),
    fathername VARCHAR(50),
    mothername VARCHAR(50),
    phone VARCHAR(15),
    whatsappnum VARCHAR(15),
    username VARCHAR(50),
    email VARCHAR(100),
    password VARCHAR(100),
    birthdate DATE,
    gender VARCHAR(10),
    uniq_id VARCHAR(50)
);
ALTER TABLE users
ADD COLUMN created_at timestamp with time zone;
ALTER TABLE users
ADD COLUMN updated_at timestamp with time zone

CREATE TABLE exams (
    exam_id SERIAL PRIMARY KEY,
    exam_name VARCHAR(100),
    file_url VARCHAR(255),
    exam_date DATE,
    exam_duration INTERVAL,
    exam_description TEXT,
    exam_score NUMERIC,
    exam_location VARCHAR(100),
    exam_status VARCHAR(20),
    exam_passing_score NUMERIC,
    exam_max_attempts INTEGER,
    is_active BOOLEAN,
    exam_created_at TIMESTAMP with time zone,
    exam_updated_at TIMESTAMP with time zone
);

