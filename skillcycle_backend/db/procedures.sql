USE skillcycle;

DELIMITER $$

DROP PROCEDURE IF EXISTS createDeal$$
CREATE PROCEDURE createDeal(
    IN in_match_id INT,
    IN in_deadline DATE,
    IN in_creator_id INT,
    OUT out_new_deal_id INT
)
BEGIN
    DECLARE v_match_exists INT DEFAULT 0;
    DECLARE v_user1_id INT;
    DECLARE v_user2_id INT;
    DECLARE v_deal_exists INT DEFAULT 0;

    START TRANSACTION;

    SELECT COUNT(*), user1_id, user2_id
    INTO v_match_exists, v_user1_id, v_user2_id
    FROM matches
    WHERE id = in_match_id;

    IF v_match_exists = 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Match not found.';
    END IF;

    IF v_user1_id != in_creator_id AND v_user2_id != in_creator_id THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: You are not authorized to create a deal for this match.';
    END IF;

    SELECT COUNT(*) INTO v_deal_exists FROM deals WHERE match_id = in_match_id;
    IF v_deal_exists > 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: A deal for this match already exists.';
    END IF;

    INSERT INTO deals (match_id, deadline, status)
    VALUES (in_match_id, in_deadline, 'in_progress');

    SET out_new_deal_id = LAST_INSERT_ID();

    UPDATE matches
    SET status = 'accepted'
    WHERE id = in_match_id;

    COMMIT;
END$$


DROP PROCEDURE IF EXISTS getRecommendations$$
CREATE PROCEDURE getRecommendations(
    IN in_user_id INT
)
BEGIN
    SELECT
        partner.id AS partner_id,
        partner.name AS partner_name,
        partner.rating AS partner_rating,
        GROUP_CONCAT(DISTINCT partner_skills.skill_name) AS partner_has_user_needs,
        GROUP_CONCAT(DISTINCT current_user_skills.skill_name) AS partner_needs_user_has
    FROM
        users AS current_user
    JOIN skills AS current_user_skills ON current_user.id = current_user_skills.user_id
        JOIN needs AS current_user_needs ON current_user.id = current_user_needs.user_id
        JOIN skills AS partner_skills ON current_user_needs.skill_name = partner_skills.skill_name
        JOIN needs AS partner_needs ON current_user_skills.skill_name = partner_needs.skill_name
        JOIN users AS partner ON partner_skills.user_id = partner.id AND partner_needs.user_id = partner.id
    WHERE
        current_user.id = in_user_id
      AND partner.id != in_user_id
    GROUP BY
        partner.id, partner.name, partner.rating
    ORDER BY
        partner.rating DESC;
END$$

DELIMITER ;