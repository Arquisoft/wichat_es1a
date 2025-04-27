let sequelize;
let userservice;
let gatewayservice;
let questionservice;

const axios = require("axios")

async function startServer() {
    try {
        process.env.TEST = 'true';
        console.log('Starting MariaDB Connection...');
        userservice = require("../../users/services/user-model");
        sequelize = userservice.sequelize;
        user_routes = await require("../../users/routes/user-routes");
        userModel =  user_routes.User;
        const user_service = require("../../users")
        createUser = require("../../users/services/user-model").createUser;
        gatewayservice = require("../../gatewayservice/gateway-service");
        // questionservice = require("../../questions/services/question-db-service.ts");

        await sequelize.authenticate();
        await sequelize.sync({force:true});

        await createUser("test-user", "test-password", "Test1", "Test1", "")

        //test user
        //const hashedPassword = await bcrypt.hash("99999999XxX.", 10);
        /*const hashedPassword = "$2a$10$azpPYhKmIKB4Mhreyq6UHOQdrHdugt7TFh.VhSED.F.QsGaQh.tZ6";
        let username = "JORDI33";
        let name = "JORDI";
        let surname = "Hurtado"
        // Create the user in the database using Sequelize
        await userModel.create({
            username,
            password: hashedPassword,
            name,
            surname
        });*/

        /*let SessionContext = await require('../src/SessionContext');
        const { createSession } = useContext(SessionContext);
        createSession("JORDI33");*/



    } catch (error) {
        console.error('Error starting server:', error);
    }

  }

  startServer();
