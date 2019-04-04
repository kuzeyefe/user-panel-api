const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');
const { User } = require('../connection');
const checkToken = require('../check-token.js');


router.get('/', checkToken, function (req, res, next) {
  if (req.userDisplayToken) {
    User.findAndCountAll().then(userList => {
      if (userList) {
        return res.send({ data: userList });
      }
      res.status(500).send({ type: "UserNotFound", msg: "There is no user" });
    });
  } else {
    return res.status(401).send({ type: 'InvalidToken', msg: "Token is not valid!" });
  }
});
router.get('/:userId/account', checkToken, function (req, res, next) {
  if (req.userDisplayToken) {
    User.findOne({
      where: {
        id: req.params.userId
      }
    }).then(user => {
      if (user) {
        return res.send({ data: user });
      }
      res.status(500).send({ type: "UserNotFound", msg: "There is no user" });
    });
  } else {
    return res.status(401).send({ type: 'InvalidToken', msg: "Token is not valid!" });
  }
});
router.put('/:userId/account', checkToken, (req, res) => {
  let putData = req.body.user;
  if(putData.password) {
    putData.password = bcrypt.hashSync(putData.password, bcrypt.genSaltSync(3))
  }
  if (req.userDisplayToken) {
    User.findOne({
      putData,
      where: {
        username: req.userDisplayToken.username
      }
    }).then(user => {
      if (user) {
        return User.update(putData, { where: { id: putData.id } })
      }
      res.status(500).send({ type: 'UserNotFound', msg: "Token user not found!" });
    }).then(updateRes => {
      if (updateRes) {
       return res.send({ data: updateRes });
      }
      res.status(500).send({ type: 'UserUpdateError', msg: "User update operation failed!" });
    })
  } else {
     res.status(401).send({ type: 'InvalidToken', msg: "Token is not valid!" });
  }
})
router.post('/', checkToken, (req, res) => {
  let postData = req.body.user;
  postData.password = bcrypt.hashSync(postData.password, bcrypt.genSaltSync(3))
  if (req.userDisplayToken) {
    User.create(postData).then(newUserRes => {
      if (newUserRes) {
        res.send({ data: newUserRes });
      }
      res.status(500).send({ type: 'UserCreateError', msg: "User create operation failed!" });
    })
  } else {
    return res.status(401).send({ type: 'InvalidToken', msg: "Token is not valid!" });
  }
});
router.put('/', checkToken, (req, res) => {
  let putData = req.body.user;
  if (req.userDisplayToken) {
    User.findOne({
      putData,
      where: {
        username: req.userDisplayToken.username
      }
    }).then(user => {
      if (user) {
        return User.update(putData, { where: { username: req.userDisplayToken.username } })
      }
      res.status(500).send({ type: 'UserNotFound', msg: "Token user not found!" });
    }).then(updateRes => {
      if (updateRes) {
       return res.send({ data: updateRes });
      }
      res.status(500).send({ type: 'UserUpdateError', msg: "User update operation failed!" });
    })
  } else {
     res.status(401).send({ type: 'InvalidToken', msg: "Token is not valid!" });
  }
})
router.get('/profile', checkToken, (req, res) => {
  if (req.userDisplayToken) {
    User.findOne({
      where: {
        username: req.userDisplayToken.username
      }
    }).then(user => {
      if (user) {
       return res.send({ data: user });
      }
      res.status(500).send({ type: 'UserNotFound', msg: "User not found!" });
    })
  } else {
    return res.status(401).send({ type: 'InvalidToken', msg: "Token is not valid!" });
  }

});
router.post('/register', (req, res) => {
  const data = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(3))
  };

  User.create(data)
    .then((user) => {
      if (!user) {
       return res.send({ type: "UserNotFound", msg: "User Not Found!" });
      }
      const token = jwt.sign({ id: user.id }, 'secret', { expiresIn: 86400 });
      return res.send({
        data: {
          token: token,
          user: user
        }
      });
    });
});

router.post('/auth', (req, res) => {
  const data = {
    username: req.body.username,
    password: req.body.password
  };
  let userData= null;
  return User.findOne({
    where: {
      username: data.username
    }
  })
    .then((user) => {
      if (user) {
        userData = user;
        return bcrypt.compare(data.password, user.password);
      }
      res.status(500).send({ type: "UserNotFound", msg: "User not found!" });
    })
    .then((lastRes) => {
      if (lastRes) {
        const tempToken = jwt.sign({ id: userData.id }, 'secret', { expiresIn: 86400 });
        const tokenData = {
          token: tempToken,
          user: userData,
        };
        res.status(200).send({ data: tokenData });
      } else {
        res.status(500).send({ type: "InvalidPassword", msg: "Your password is invalid!" });
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});


module.exports = router;
