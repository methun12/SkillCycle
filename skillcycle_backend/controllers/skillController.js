const skillModel = require('../models/skillModel');

/**
 * Controller for handling logic related to skills, needs, matches, and trends.
 */
const skillController = {

    /**
     * Adds a new skill to the currently logged-in user's profile (a "have").
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async addSkillHave(req, res) {
        try {
            const { skill_name, level } = req.body;
            const userId = req.user.id; // From authMiddleware

            if (!skill_name || !level) {
                return res.status(400).json({ message: 'Skill name and level are required.' });
            }

            const newSkill = await skillModel.addHave(userId, skill_name, level);
            res.status(201).json({ message: 'Skill added successfully.', skill: newSkill });

        } catch (error) {
            console.error('Add Skill Have Error:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'You have already added this skill.' });
            }
            res.status(500).json({ message: 'Server error while adding skill.' });
        }
    },

    /**
     * Adds a new skill that the currently logged-in user needs (a "want").
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async addSkillNeed(req, res) {
        try {
            const { skill_name, urgency_level } = req.body;
            const userId = req.user.id; // From authMiddleware

            if (!skill_name || !urgency_level) {
                return res.status(400).json({ message: 'Skill name and urgency level are required.' });
            }

            const newNeed = await skillModel.addNeed(userId, skill_name, urgency_level);
            res.status(201).json({ message: 'Needed skill added successfully.', need: newNeed });

        } catch (error) {
            console.error('Add Skill Need Error:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'You have already added this skill to your needs.' });
            }
            res.status(500).json({ message: 'Server error while adding needed skill.' });
        }
    },

    /**
     * Fetches all skills (both 'haves' and 'needs') for the currently logged-in user.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async getMySkills(req, res) {
        try {
            const userId = req.user.id;

            const [skillsHave, skillsWant] = await Promise.all([
                skillModel.findHavesByUserId(userId),
                skillModel.findNeedsByUserId(userId)
            ]);

            res.status(200).json({ skillsHave, skillsWant });

        } catch (error) {
            console.error('Get My Skills Error:', error);
            res.status(500).json({ message: 'Server error while fetching user skills.' });
        }
    },

    /**
     * Finds potential skill exchange match recommendations for the currently logged-in user.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async findMatches(req, res) {
        try {
            const userId = req.user.id;

            const matches = await skillModel.findMatchesForUser(userId);
            res.status(200).json(matches);

        } catch (error) {
            console.error('Find Matches Error:', error);
            res.status(500).json({ message: 'Server error while finding matches.' });
        }
    },

    /**
     * Creates a new match record in the database when a user accepts a recommendation.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async createMatch(req, res) {
        try {
            const user1_id = req.user.id;
            const { partnerId: user2_id, skillExchange } = req.body;

            if (!user2_id) {
                return res.status(400).json({ message: 'Partner ID is required.' });
            }

            const newMatch = await skillModel.createMatch(user1_id, user2_id, skillExchange);
            res.status(201).json({ message: 'Match created successfully.', match: newMatch });

        } catch (error) {
            console.error('Create Match Error:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'A match with this user already exists.' });
            }
            res.status(500).json({ message: 'Server error while creating match.' });
        }
    },

    /**
     * Deletes a skill from the user's "have" list.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async removeSkillHave(req, res) {
        try {
            const { skillId } = req.params;
            const userId = req.user.id;

            await skillModel.removeHave(skillId, userId);
            res.status(204).send();

        } catch (error) {
            console.error('Remove Skill Have Error:', error);
            res.status(500).json({ message: 'Server error while removing skill.' });
        }
    },

    /**
     * Deletes a skill from the user's "need" list.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async removeSkillNeed(req, res) {
        try {
            const { needId } = req.params;
            const userId = req.user.id;

            await skillModel.removeNeed(needId, userId);
            res.status(204).send();

        } catch (error) {
            console.error('Remove Skill Need Error:', error);
            res.status(500).json({ message: 'Server error while removing needed skill.' });
        }
    },

    /**
     * **NEW**: Fetches the top 5 most requested skills from the `top_skills_view`.
     * This is used to power the "Trending Skills" section of the dashboard.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async getTrendingSkills(req, res) {
        try {
            const skills = await skillModel.getTrendingSkills();
            res.status(200).json(skills);
        } catch (error) {
            console.error('Get Trending Skills Error:', error);
            res.status(500).json({ message: 'Server error while fetching trending skills.' });
        }
    },
};

module.exports = skillController;