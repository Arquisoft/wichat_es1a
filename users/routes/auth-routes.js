const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const assert = require("../assert")

const { User } = require('../services/user-model');

router.post('/', async (req, res) => {
    try {
      let { username, password } = req.body;

      if (!username)
        return res.status(400).json({ error: "Missing username" })
      if (!password)
        return res.status(400).json({ error: "Missing password" })

     username = username.trim()
     password = password.trim()

      if (!username) {
        return res.status(400).json({ error: "The username is empty" })
      }
      if (!password) {
        return res.status(400).json({ error: "The password is empty" })
      }

      const user = await User.findOne({ where: { username } });

      if (!user) {
        return res.status(401).json({ error: `Couldn't find user with the specified username: "${username}"` });
      }

      assert(user.username === username, "User.findOne will only return an user that matches the username. They mut be equal")

      let hashed = bcrypt.hashSync(password, user.salt)

      if (hashed === user.password) {
        return res.status(200).json({ username, createdAt: user.createdAt, avatar: user.imageUrl });
      } else {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
          const validationErrors = error.errors.map(err => err.message);
          res.status(400).json({ error: 'Error de validación', details: validationErrors });
      } else {
          res.status(402).json({ error: error.message });
      }
    }
  });


module.exports = router;
