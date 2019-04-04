const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const { User } = require('./connection');
module.exports = function (req, res, next) {
  let token = req.headers['authorization'];
  if (token) {
    jwt.verify(token, 'secret', (err, decoded) => {
      if (err) {
        next();
      } else {
        req.decoded = decoded;
        User.findOne({
          where: {
            id: decoded.id
          }
        }).then(user => {
          if (user) {
            req["userDisplayToken"] = user;
            next();
          } else {
              next();
          }
        })
      }
    });
  } else {
    next();
  }
}