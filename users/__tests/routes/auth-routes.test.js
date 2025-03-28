const { sequelize } = require('../../services/user-model.js');
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('../../routes/user-routes.js');
const authRoutes = require('../../routes/auth-routes.js');
const config = require('../test-config.js');

const app = express();
app.use(bodyParser.json());
app.use('/user', userRoutes);
app.use('/login', authRoutes);

describe('Auth Routes', () => {

    beforeEach(async () => {
        await sequelize.authenticate();
        await sequelize.sync({ force: true });


    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('shouldn`t login a user because of the white username', async () => {

        // Create the existing user in the database
        await config.createUser({
            username: 'existinguser',
            password: 'Test1234', //NOSONAR
            createdAt: new Date(),
            updatedAt: new Date(),
            name: 'Existing',
            surname: 'User'
        });

        // We make the wrong login request
        const response = await request(app)
            .post('/login')
            .send({ username: '   ',
                password: 'Test1234' //NOSONAR
            });

        // We now need to check that the response is correct and it shows the error
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("The username is empty");
    });

    it('shouldn`t login a user because of the white password', async () => {

        // Create the existing user in the database
        await config.createUser({
            username: 'existinguser',
            password: 'Test1234', //NOSONAR
            createdAt: new Date(),
            updatedAt: new Date(),
            name: 'Existing',
            surname: 'User'
        });

        // We make the wrong login request
        const response = await request(app)
            .post('/login')
            .send({ username: 'existinguser',
                password: '    ' //NOSONAR
            });

        // We now need to check that the response is correct and it shows the error
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("The password is empty");
    });

    it('shouldn`t login a user due to not including the password', async () => {

        // Create the existing user in the database
        await config.createUser({
            username: 'existinguser',
            password: 'Test1234', //NOSONAR
            createdAt: new Date(),
            updatedAt: new Date(),
            name: 'Existing',
            surname: 'User'
        });

        // We make the wrong login request
        const response = await request(app)
            .post('/login')
            .send({ username: 'existinguser' });

        // We now need to check that the response is correct and it shows the error
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Missing password");
    });

    it('shouldn`t login a user due to wrong username credential', async () => {

        // Create the existing user in the database
        await config.createUser({
            username: 'existinguser',
            password: 'Test1234', //NOSONAR
            createdAt: new Date(),
            updatedAt: new Date(),
            name: 'Existing',
            surname: 'User'
        });

        // We make the wrong login request
        const response = await request(app)
            .post('/login')
            .send({ username: 'notexistinguser',
                password: 'Test1234' //NOSONAR
            });

        // We now need to check that the response is correct and it shows the error
        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe('Couldn\'t find user with the specified username: "notexistinguser"');
    });

    it('shouldn`t login a user due to wrong password credential', async () => {

        // Create the existing user in the database
        await config.createUser({
            username: 'existinguser',
            password: 'Test1234', //NOSONAR
            createdAt: new Date(),
            updatedAt: new Date(),
            name: 'Existing',
            surname: 'User'
        });

        // We make the wrong login request
        const response = await request(app)
            .post('/login')
            .send({ username: 'existinguser',
                password: 'WrongPassword' //NOSONAR
            });

        // We now need to check that the response is correct and it shows the error
        expect(response.body.error).toBe('Invalid credentials');
        expect(response.statusCode).toBe(401);
    });

    it('should login a user', async () => {

        // Create the existing user in the database
        await config.createUser({
            username: 'existinguser',
            password: 'Test1234', //NOSONAR
            createdAt: new Date(),
            updatedAt: new Date(),
            name: 'Existing',
            surname: 'User'
        });

        // We make the login request
        const response = await request(app)
            .post('/login')
            .send({ username: 'existinguser',
                password: 'Test1234' //NOSONAR
            });

        // We now need to check that the response is correct
        expect(response.statusCode).toBe(200);
    });

});
