USE skillcycle;

DELIMITER $$

DROP TABLE IF EXISTS deal_history;
CREATE TABLE deal_history (
                              id INT AUTO_INCREMENT PRIMARY KEY,
                              deal_id INT,
                              old_status ENUM('in_progress', 'completed', 'cancelled'),
                              new_status ENUM('in_progress', 'completed', 'cancelled'),
                              changed_by_user_id INT,
                              changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


DROP TRIGGER IF EXISTS after_rating_insert_update_user_rating$$
CREATE TRIGGER after_rating_insert_update_user_rating
    AFTER INSERT ON ratings
    FOR EACH ROW
BEGIN
    DECLARE new_avg_rating DECIMAL(3, 2);

    SELECT AVG(rating)
    INTO new_avg_rating
    FROM ratings
    WHERE ratee_id = NEW.ratee_id;

    UPDATE users
    SET rating = new_avg_rating
    WHERE id = NEW.ratee_id;
END$$


DROP TRIGGER IF EXISTS after_deal_update_log_history$$
CREATE TRIGGER after_deal_update_log_history
    AFTER UPDATE ON deals
    FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO deal_history (deal_id, old_status, new_status, changed_by_user_id)
        VALUES (NEW.id, OLD.status, NEW.status, @current_user_id);
    END IF;
END$$

DELIMITER ;