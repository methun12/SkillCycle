CREATE DATABASE IF NOT EXISTS skillcycle;
USE skillcycle;

DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS deals;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS needs;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       name VARCHAR(255) NOT NULL,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       rating DECIMAL(3, 2) DEFAULT 5.00,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE skills (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT NOT NULL,
                        skill_name VARCHAR(255) NOT NULL,
                        level ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                        UNIQUE KEY user_skill (user_id, skill_name)
) ENGINE=InnoDB;

CREATE TABLE needs (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       user_id INT NOT NULL,
                       skill_name VARCHAR(255) NOT NULL,
                       urgency_level ENUM('Low', 'Medium', 'High') NOT NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                       UNIQUE KEY user_need (user_id, skill_name)
) ENGINE=InnoDB;

CREATE TABLE matches (
                         id INT AUTO_INCREMENT PRIMARY KEY,
                         user1_id INT NOT NULL,
                         user2_id INT NOT NULL,
                         skill_exchange TEXT,
                         status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
                         FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
                         UNIQUE KEY unique_match_pair (user1_id, user2_id)
) ENGINE=InnoDB;

CREATE TABLE deals (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       match_id INT NOT NULL UNIQUE,
                       deadline DATE NOT NULL,
                       status ENUM('in_progress', 'completed', 'cancelled') DEFAULT 'in_progress',
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ratings (
                         id INT AUTO_INCREMENT PRIMARY KEY,
                         deal_id INT NOT NULL,
                         rater_id INT NOT NULL,
                         ratee_id INT NOT NULL,
                         rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                         feedback TEXT,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
                         FOREIGN KEY (rater_id) REFERENCES users(id) ON DELETE CASCADE,
                         FOREIGN KEY (ratee_id) REFERENCES users(id) ON DELETE CASCADE,
                         UNIQUE KEY unique_rating (deal_id, rater_id)
) ENGINE=InnoDB;