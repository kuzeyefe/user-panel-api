const Sequelize = require('sequelize');
const UserModel = require('./database/model/user.js');
const TokenModel = require('./database/model/token.js');


const sequelize = new Sequelize('user_panel', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });

  sequelize.sync({force:true})
  .then(() => {
    console.log(`Database & tables created!`)
  });

const User = UserModel(sequelize, Sequelize);
const Token = TokenModel(sequelize, Sequelize);
User.belongsTo(Token);

module.exports = {
  User,
  Token
}