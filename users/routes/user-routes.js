const express = require('express');
const router = express.Router();
const { User, Statistics, Group, UserGroup, QuestionsRecord, sequelize, createUser } = require('../services/user-model');
const { getRandomPic } = require("../data/icons");
const assert = require("../assert")


router.get('/profile', async (req, res) => {
    try {
        const username = req.query.username;

        // Querying using sequelize findOne method
        const user = await User.findOne({
            where: {
                username: username
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/profile/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const { imageUrl } = req.body;

        //Update the user's fields with the provided values
        const [affectedRows] = await User.update({ imageUrl }, { where: { username } });
        if (affectedRows === 0) {
            return res.status(404).json({ error: 'No se ha podido actualizar el usuario' });
        }

        res.status(200).json({ affectedRows });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
});


//Get user by username
router.get('/:username', async (req,res) => {
    try {

        const username = req.params.username;

        // Querying using sequelize findOne method
        const user = await User.findOne({
            where: {
                username: username
            }
        });

        const userJSON = user.toJSON();
        res.json(userJSON);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

});
//Get all users
router.get('/', async (req,res) => {

    try {

        const allUsers = await User.findAll();

        // Converting each user to a JSON object
        const usersJSON = allUsers.map(user => user.toJSON());

        // Returned object in response, it contains a list of JSON objects (each user)
        const allUsersJSON = {
            users: usersJSON
        };

        res.json(allUsersJSON);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Route for add a question to questions record
router.post('/questionsRecord', async (req, res) => {
    try {
        const { username, questions, gameMode} = req.body;

        // Create new question
        const newQuestionRecord = await QuestionsRecord.create({
            questions,
            username,
            gameMode,
        });

        res.json(newQuestionRecord);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route to add a user
router.post('/', async (req, res) => {
    try {
        let { username, password, name, surname } = req.body;

        const user = await User.findOne({ where: { username } });

        if (user != null) {
            throw new Error('Usuario inválido');
        }

        // Email validation
        if (username.trim().length < 4) {
            throw new Error('El usuario debe contener al menos 4 caracteres');
        }

        // Password validation
        if (password.trim().length < 8) {
            throw new Error('La contraseña debe contener al menos 8 caracteres');
        }
        if (!/\d/.test(password)) {
            throw new Error('La contraseña debe contener al menos un número');
        }
        if (!/[A-Z]/.test(password)) {
            throw new Error('La contraseña debe contener al menos una mayúscula');
        }

        // Name validation
        if (!name.trim()) {
            throw new Error('El nombre no puede estar vacío');
        }

        // Surname validation
        if (!surname.trim()) {
            throw new Error('El apellido no puede estar vacío');
        }

        const imageUrl = getRandomPic();

        // Create the user in the database using Sequelize
        const newUser = createUser(username, password, name, surname, imageUrl);
        console.log(`Nuevo usuario creado '${username}'`);

        // Create the user statistics
        await Statistics.create({
            username
        })

        res.json({username});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route for edit the statics of a user
router.post('/statistics', async (req, res) => {
    try {

        const { username, the_callenge_earned_money, the_callenge_correctly_answered_questions, the_callenge_incorrectly_answered_questions,
            the_callenge_total_time_played, the_callenge_games_played, wise_men_stack_earned_money, wise_men_stack_correctly_answered_questions,
            wise_men_stack_incorrectly_answered_questions, wise_men_stack_games_played, warm_question_earned_money, warm_question_correctly_answered_questions,
            warm_question_incorrectly_answered_questions, warm_question_passed_questions, warm_question_games_played, discovering_cities_earned_money,
            discovering_cities_correctly_answered_questions, discovering_cities_incorrectly_answered_questions, discovering_cities_games_played, online_earned_money,
            online_correctly_answered_questions, online_incorrectly_answered_questions, online_total_time_played, online_games_played} = req.body;

        // Find the user in the database by their username
        const statisticsUserToUpdate = await Statistics.findOne({
            where: {
                username: username
            }
        });

        // Check if the user exists
        if (!statisticsUserToUpdate) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Update the user's fields with the provided values
        statisticsUserToUpdate.the_callenge_earned_money += the_callenge_earned_money;
        statisticsUserToUpdate.the_callenge_correctly_answered_questions += the_callenge_correctly_answered_questions;
        statisticsUserToUpdate.the_callenge_incorrectly_answered_questions += the_callenge_incorrectly_answered_questions;
        statisticsUserToUpdate.the_callenge_total_time_played += the_callenge_total_time_played;
        statisticsUserToUpdate.the_callenge_games_played += the_callenge_games_played;

        statisticsUserToUpdate.wise_men_stack_earned_money += wise_men_stack_earned_money;
        statisticsUserToUpdate.wise_men_stack_correctly_answered_questions += wise_men_stack_correctly_answered_questions;
        statisticsUserToUpdate.wise_men_stack_incorrectly_answered_questions += wise_men_stack_incorrectly_answered_questions;
        statisticsUserToUpdate.wise_men_stack_games_played += wise_men_stack_games_played;

        statisticsUserToUpdate.warm_question_earned_money += warm_question_earned_money;
        statisticsUserToUpdate.warm_question_correctly_answered_questions += warm_question_correctly_answered_questions;
        statisticsUserToUpdate.warm_question_incorrectly_answered_questions += warm_question_incorrectly_answered_questions;
        statisticsUserToUpdate.warm_question_passed_questions += warm_question_passed_questions;
        statisticsUserToUpdate.warm_question_games_played += warm_question_games_played;

        statisticsUserToUpdate.discovering_cities_earned_money += discovering_cities_earned_money;
        statisticsUserToUpdate.discovering_cities_correctly_answered_questions += discovering_cities_correctly_answered_questions;
        statisticsUserToUpdate.discovering_cities_incorrectly_answered_questions += discovering_cities_incorrectly_answered_questions;
        statisticsUserToUpdate.discovering_cities_games_played += discovering_cities_games_played;

        statisticsUserToUpdate.online_earned_money += online_earned_money;
        statisticsUserToUpdate.online_correctly_answered_questions += online_correctly_answered_questions;
        statisticsUserToUpdate.online_incorrectly_answered_questions += online_incorrectly_answered_questions;
        statisticsUserToUpdate.online_total_time_played += online_total_time_played;
        statisticsUserToUpdate.online_games_played += online_games_played;

        // Save the changes to the database
        await statisticsUserToUpdate.save();
        res.status(200);
        res.json({ message: 'Estadísticas actualizadas correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});
//Get user statics by username
router.get('/statistics/:username', async (req,res) => {
    try {

        const username = req.params.username;
        const loggedUser = req.query.loggedUser;

        if(loggedUser === null || loggedUser === undefined){
            return res.status(403).json({ error: 'Debes haber iniciado sesión para ver las estadísticas de este usuario' });
        }else if(username !== loggedUser){
            const userGroups = await UserGroup.findAll({
                where: {
                  username: username
                }
            });

            const loggedUserGroups = await UserGroup.findAll({
                where: {
                  username: loggedUser
                }
            });

            if (loggedUserGroups.length != 0 && userGroups != 0){
                const hasCommonGroup = userGroups.some(userGroup => {
                    return loggedUserGroups.some(loggedUserGroup => loggedUserGroup.groupName === userGroup.groupName);
                });

                if(!hasCommonGroup){
                    return res.status(403).json({ error: 'No puedes ver las estadísticas de este usuario' });
                }
            }
        }

        // Querying using sequelize findOne method
        const user = await Statistics.findOne({
            where: {
                username: username
            }
        });

        const userJSON = user.toJSON();
        res.json(userJSON);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

});


module.exports = router;
