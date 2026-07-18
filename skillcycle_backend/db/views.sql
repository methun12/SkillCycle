USE skillcycle;

CREATE OR REPLACE VIEW active_deals_view AS
SELECT
    d.id AS deal_id,
    d.status,
    d.deadline,
    m.id AS match_id,
    m.skill_exchange,
    u1.id AS user1_id,
    u1.name AS user1_name,
    u2.id AS user2_id,
    u2.name AS user2_name,
    d.created_at AS deal_created_at
FROM
    deals AS d
        JOIN
    matches AS m ON d.match_id = m.id
        JOIN
    users AS u1 ON m.user1_id = u1.id
        JOIN
    users AS u2 ON m.user2_id = u2.id
WHERE
    d.status = 'in_progress'
ORDER BY
    d.deadline ASC;

CREATE OR REPLACE VIEW top_skills_view AS
SELECT
    skill_name,
    COUNT(id) AS request_count
FROM
    needs
GROUP BY
    skill_name
ORDER BY
    request_count DESC;

CREATE OR REPLACE VIEW user_summary_view AS
SELECT
    u.id AS user_id,
    u.name AS user_name,
    u.email AS user_email,
    u.rating AS average_rating,
    (SELECT COUNT(*) FROM matches m JOIN deals d ON m.id = d.match_id WHERE m.user1_id = u.id OR m.user2_id = u.id) AS total_deals,
    (SELECT COUNT(*) FROM matches m JOIN deals d ON m.id = d.match_id WHERE (m.user1_id = u.id OR m.user2_id = u.id) AND d.status = 'completed') AS completed_deals,
    u.created_at AS member_since
FROM
    users u
ORDER BY
    u.name ASC;