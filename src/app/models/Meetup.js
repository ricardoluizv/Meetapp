import Sequelize, { Model } from 'sequelize';

class Meetup extends Model {
  static init(sequelize) {
    super.init(
      {
        title: Sequelize.STRING,
        description: Sequelize.STRING,
        address: Sequelize.STRING,
        number: Sequelize.STRING,
        uf: Sequelize.STRING,
        date: Sequelize.DATE,
        user_id: Sequelize.INTEGER,
        avatar_id: Sequelize.INTEGER,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.File, {
      foreignKey: 'avatar_id',
      as: 'avatar',
    });
  }
}

export default Meetup;
