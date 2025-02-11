const bcrypt = require('bcrypt');
const { User } = require('../services/user-model.js');

const config = {
  users: {
    normalPassword: "Test1234",
    shortPassword: 'Short1',
    noNumberPassword: 'PasswordWithoutNumber',
    noUppercasePassword: 'passwordwithoutuppercase1',
  },
  createUser : (usr) => {
      usr.salt = bcrypt.genSaltSync(10)
      usr.password = bcrypt.hashSync(usr.password, usr.salt)
      return User.create(usr)
  }
};

module.exports = config;
