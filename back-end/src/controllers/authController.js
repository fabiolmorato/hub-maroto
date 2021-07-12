const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const AuthenticationError = require('../errors/AuthenticationError');

class AuthController {
  async login (username, password) {
    const user = await User.findOne({
      where: {
        username
      }
    });

    if (!user) throw new AuthenticationError();

    if (!bcrypt.compareSync(password, user.password)) throw new AuthenticationError();

    const token = jwt.sign({
      id: user.id
    }, process.env.JWT_SECRET);

    return {
      name: user.name,
      email: user.email,
      username: user.username,
      token
    };
  }
}

module.exports = new AuthController();
