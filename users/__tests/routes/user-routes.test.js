const { User, Statistics, sequelize, UserGroup, QuestionsRecord } = require('../../services/user-model.js');
const bcrypt = require('bcrypt');
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('../../routes/user-routes.js');
const config = require('../test-config.js');

const app = express();
app.use(bodyParser.json());
app.use('/user', userRoutes);
const password = config.users.normalPassword;

describe('User Routes', () => {

    beforeEach(async () => {
        await sequelize.authenticate();
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    // QUESTIONS RECORD
    it('should add a new question record', async () => {
        const newQuestionRecord = {
            username: 'testuser',
            questions: ['Question 1', 'Question 2'],
            gameMode: 'classic'
        };

        const response = await request(app)
            .post('/user/questionsRecord')
            .send(newQuestionRecord);

        expect(response.status).toBe(200);
        expect(response.body.username).toBe(newQuestionRecord.username);
        expect(response.body.questions).toEqual(newQuestionRecord.questions);
        expect(response.body.gameMode).toBe(newQuestionRecord.gameMode);
    });

    it('should return an error if required fields are missing', async () => {
        const invalidQuestionRecord = {
            gameMode: 'classic'
        };

        const response = await request(app)
            .post('/user/questionsRecord')
            .send(invalidQuestionRecord);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    // ADD USER TESTS
    it('should add a new user', async () => {
        const newUser = {
            username: 'testuser',
            password: password,
            name: 'Test',
            surname: 'User'
        };
        const response = await request(app)
            .post('/user')
            .send(newUser);

        expect(response.status).toBe(200);
        expect(response.body.username).toBe(newUser.username);

        const user = await User.findOne({ where: { username: newUser.username } });
        expect(user).toBeDefined();

        expect(user.salt).toBeDefined();
        expect(user.salt.trim()).toBeTruthy();

        const isPasswordCorrect = await bcrypt.compare(newUser.password, user.password);
        expect(isPasswordCorrect).toBe(true);

        const statistics = await Statistics.findOne({ where: { username: newUser.username } });
        expect(statistics).toBeDefined();
    });

    it('should return error if username is too short', async () => {
        const newUser = {
            username: 'abc',
            password: password,
            name: 'John',
            surname: 'Doe'
        };

        const response = await request(app)
            .post('/user')
            .send(newUser);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('El usuario debe contener al menos 4 caracteres');
    });

    it('should return error if password is too short', async () => {
        const newUser = {
            username: 'newuser',
            password: config.users.shortPassword,
            name: 'John',
            surname: 'Doe'
        };

        const response = await request(app)
            .post('/user')
            .send(newUser);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('La contraseña debe contener al menos 8 caracteres');
    });

    it('should return error if password lacks a number', async () => {
        const newUser = {
            username: 'newuser',
            password: config.users.noNumberPassword,
            name: 'John',
            surname: 'Doe'
        };

        const response = await request(app)
            .post('/user')
            .send(newUser);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('La contraseña debe contener al menos un número');
    });

    it('should return error if password lacks an uppercase letter', async () => {
        const newUser = {
            username: 'newuser',
            password: config.users.noUppercasePassword,
            name: 'John',
            surname: 'Doe'
        };

        const response = await request(app)
            .post('/user')
            .send(newUser);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('La contraseña debe contener al menos una mayúscula');
    });

    it('should return error if name is empty', async () => {
        const newUser = {
            username: 'newuser',
            password: password,
            name: '',
            surname: 'Doe'
        };

        const response = await request(app)
            .post('/user')
            .send(newUser);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('El nombre no puede estar vacío');
    });

    it('should return error if surname is empty', async () => {
        const newUser = {
            username: 'newuser',
            password: password,
            name: 'John',
            surname: ' '
        };

        const response = await request(app)
            .post('/user')
            .send(newUser);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('El apellido no puede estar vacío');
    });

    // GET USERS
    it('should get all users', async () => {
        await config.createUser({ username: 'user1', password, name: 'Name', surname: 'Surname' });
        await config.createUser({ username: 'user2', password, name: 'Name2', surname: 'Surname2' });

        const response = await request(app).get('/user');

        expect(response.status).toBe(200);
        expect(response.body.users.length).toBe(2);
    });

    it('should get user by username', async () => {
        await config.createUser({ username: 'testuser3', password, name: 'Test', surname: 'User' });

        const response = await request(app)
            .get('/user/testuser3');

        expect(response.status).toBe(200);
        expect(response.body.username).toBe('testuser3');
    });

    // PROFILE
    it('should get user profile by query', async () => {
        await config.createUser({ username: 'testuser1', password, name: 'Test', surname: 'User' });

        const response = await request(app)
            .get('/user/profile')
            .query({ username: 'testuser1' });

        expect(response.status).toBe(200);
        expect(response.body.user.username).toBe('testuser1');
    });

    it('should return error when profile not found', async () => {
        const response = await request(app)
            .get('/user/profile')
            .query({ username: 'doesnotexist' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Usuario no encontrado');
    });

    it('should update user profile image', async () => {
        await config.createUser({ username: 'testuser1', password, name: 'Test', surname: 'User' });

        const response = await request(app)
            .post('/user/profile/testuser1')
            .send({ imageUrl: 'https://fakeimg.pl/image.jpg' });

        expect(response.status).toBe(200);
        expect(response.body.affectedRows).toBe(1);
    });

    it('should return error if user image update fails', async () => {
        const response = await request(app)
            .post('/user/profile/notexist')
            .send({ imageUrl: 'https://fakeimg.pl/image.jpg' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('No se ha podido actualizar el usuario');
    });

    // STATISTICS

    it('should return error if statistics user not found', async () => {
        const response = await request(app)
            .post('/user/statistics')
            .send({ username: 'ghostuser' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Usuario no encontrado');
    });

    it('should block access to statistics without login', async () => {
        const response = await request(app)
            .get('/user/statistics/someuser');

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('Debes haber iniciado sesión para ver las estadísticas de este usuario');
    });
});
