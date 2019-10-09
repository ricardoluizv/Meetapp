import Sequelize, { Model } from 'sequelize';

class MeetRegistration extends Model {
  static init(sequelize) {
    super.init(
      {
        meetup_id: Sequelize.INTEGER,
        user_id: Sequelize.INTEGER,
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Meetup, { foreignKey: 'meetup_id', as: 'meetups' });
  }
}

export default MeetRegistration;
