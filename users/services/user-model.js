const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require("bcrypt")

// Function to create Sequelize instance with appropriate configurations
function createSequelizeInstance() {
    const logging = process.env.SEQUELIZE_LOGGING == "true";

    if (process.env.TEST == "true") {
        // Use SQLite in-memory database for testing
        return new Sequelize({
            dialect: 'sqlite',
            storage: ':memory:',
            logging
        });
    } else {
        return new Sequelize({
            dialect: 'sqlite',
            storage: '/var/users_db.sqlite',
            logging
        });
    }
}

async function createUser(username, password, name, surname, imageUrl) {
    const salt = bcrypt.genSaltSync();

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Create the user in the database using Sequelize
    return await User.create({
        username,
        password: hashedPassword,
        salt,
        name,
        surname,
        imageUrl
    });
}

// Database connection configuration
const sequelize = createSequelizeInstance();

// Define the user model
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        primaryKey: true,
        notEmpty: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    salt: {
        type: DataTypes.STRING,
        nonEmpty: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        notEmpty: true,
    },
    surname: {
        type: DataTypes.STRING,
        allowNull: false,
        notEmpty: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    imageUrl: {
        type: DataTypes.STRING,
        defaultValue: "default_user.jpg",
    }
});

// Define the group model
const Group = sequelize.define('Group', {
    name: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    creator: {
        type: DataTypes.STRING,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
    // When the session is introduced, the creator user and more stuff will be added
})

// Define the user group model
const UserGroup = sequelize.define('UserGroup', {
    enteredAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
});

User.belongsToMany(Group, { through: {model: UserGroup,timestamps: false}, foreignKey: 'username', otherKey: 'groupName' });
Group.belongsToMany(User, { through: {model: UserGroup,timestamps: false}, foreignKey: 'groupName', otherKey: 'username', });

// Define the statics model
const Statistics = sequelize.define('Statistics', {
    // Add userId column as foreign key
    username: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    the_callenge_earned_money: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    the_callenge_correctly_answered_questions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    the_callenge_incorrectly_answered_questions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    the_callenge_total_time_played: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    the_callenge_games_played: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    wise_men_stack_earned_money: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    wise_men_stack_correctly_answered_questions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    wise_men_stack_incorrectly_answered_questions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    wise_men_stack_games_played: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    warm_question_earned_money: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    warm_question_correctly_answered_questions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    warm_question_incorrectly_answered_questions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    warm_question_passed_questions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    warm_question_games_played: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    discovering_cities_earned_money: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    discovering_cities_correctly_answered_questions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    discovering_cities_incorrectly_answered_questions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    discovering_cities_games_played: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    online_earned_money: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    online_correctly_answered_questions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    online_incorrectly_answered_questions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    online_total_time_played: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    online_games_played: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
})

// Define the relationship between User and Statics
User.hasOne(Statistics, { foreignKey: 'username' });
Statistics.belongsTo(User, { foreignKey: 'username' });

// Define the Questions model
const QuestionsRecord = sequelize.define('QuestionsRecord', {
    questions: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    gameMode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Synchronize the model with the database
sequelize.sync({})
    .then(() => {
        console.log('Model synchronized successfully with the database');
    })
    .catch((err) => {
        console.error('Error synchronizing the model with the database:', err);
    });

// Authenticate the database connection
sequelize
    .authenticate()
    .then(() => {
        console.log('Successful connection to the database');
    })
    .catch((err) => {
        console.error('Error connecting to the database:', err);
    });

module.exports = { sequelize, User, Group, UserGroup, Statistics, QuestionsRecord, createUser };
