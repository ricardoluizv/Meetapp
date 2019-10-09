import Sequelize from 'sequelize';

// #region MODELS

import User from '../app/models/User';
import File from '../app/models/File';
import Meetup from '../app/models/Meetup';
import MeetRegistration from '../app/models/MeetRegistration';

// #endregion

// importa a string de conexão com o banco
import databaseConfig from '../config/database';

const models = [User, File, Meetup, MeetRegistration];

class Database {
  constructor() {
    this.init();
  }

  init() {
    // cria uma conexão com o banco de dados
    this.connection = new Sequelize(databaseConfig);

    // atribui aos metodos init do(S) model(s) especificado na variavel model, o sequelize (this.connection)
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
