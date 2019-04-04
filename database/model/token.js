module.exports = (sequelize, types) => {
    return sequelize.define('token', {
      id: {
        type: types.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: types.INTEGER,
      },
      token: {
        type: types.STRING,
      },
    },
    {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    });
  };
  