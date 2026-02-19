-- Create database
CREATE DATABASE IF NOT EXISTS howiya_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE howiya_db;

-- Table for employee IDs
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identity_number VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for formulaire data
CREATE TABLE IF NOT EXISTS formulaire (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identity_number VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    identity_expiry_date DATE,
    mobile_number VARCHAR(20),
    birth_date DATE,
    agency VARCHAR(100),
    administration VARCHAR(100),
    job_title VARCHAR(100),
    gender ENUM('male', 'female') DEFAULT 'male',
    marital_status ENUM('single', 'married', 'divorced', 'widowed') DEFAULT 'single',
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (identity_number) REFERENCES employees(identity_number) ON DELETE CASCADE
);

-- Table for dependents
CREATE TABLE IF NOT EXISTS dependents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    formulaire_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    identity_number VARCHAR(20),
    birth_date DATE,
    relationship VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (formulaire_id) REFERENCES formulaire(id) ON DELETE CASCADE
);

-- Insert some test data
INSERT INTO employees (identity_number) VALUES ('1234567890');
INSERT INTO employees (identity_number) VALUES ('9876543210');
