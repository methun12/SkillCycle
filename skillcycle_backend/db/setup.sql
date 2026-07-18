CREATE DATABASE IF NOT EXISTS skillcycle;
USE skillcycle;

DROP VIEW IF EXISTS user_summary_view;
DROP VIEW IF EXISTS active_deals_view;
DROP VIEW IF EXISTS top_skills_view;
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
    -- CORRECTED: Added the missing created_at column
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
    -- Added for consistency
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


INSERT INTO skills (user_id, skill_name, level) VALUES (1, 'Vue.js Development', 'Advanced'), (1, 'Node.js', 'Intermediate'), (2, 'Python Data Analysis', 'Intermediate'), (2, 'Content Writing', 'Expert'), (3, 'Graphic Design', 'Beginner');
INSERT INTO needs (user_id, skill_name, urgency_level) VALUES (1, 'Python Data Analysis', 'High'), (1, 'Digital Marketing', 'Low'), (2, 'Vue.js Development', 'Medium'), (3, 'Content Writing', 'High'), (3, 'Node.js', 'Medium');


CREATE OR REPLACE VIEW top_skills_view AS
SELECT skill_name, COUNT(id) AS request_count
FROM needs
GROUP BY skill_name
ORDER BY request_count DESC;

CREATE OR REPLACE VIEW active_deals_view AS
SELECT d.id AS deal_id, d.status, d.deadline, m.id AS match_id, m.skill_exchange, u1.id AS user1_id, u1.name AS user1_name, u2.id AS user2_id, u2.name AS user2_name, d.created_at AS deal_created_at
FROM deals AS d
         JOIN matches AS m ON d.match_id = m.id
         JOIN users AS u1 ON m.user1_id = u1.id
         JOIN users AS u2 ON m.user2_id = u2.id
WHERE d.status = 'in_progress';

CREATE OR REPLACE VIEW user_summary_view AS
SELECT u.id AS user_id, u.name AS user_name, u.email AS user_email, u.rating AS average_rating,
       (SELECT COUNT(*) FROM matches m JOIN deals d ON m.id = d.match_id WHERE m.user1_id = u.id OR m.user2_id = u.id) AS total_deals,
       (SELECT COUNT(*) FROM matches m JOIN deals d ON m.id = d.match_id WHERE (m.user1_id = u.id OR m.user2_id = u.id) AND d.status = 'completed') AS completed_deals,
       u.created_at AS member_since
FROM users u ORDER BY u.name ASC;

SELECT 'Database setup complete with tables, dummy data, and views.' AS status;
