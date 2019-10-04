import {
  parseISO,
  isAfter,
  subHours,
  startOfHour,
  endOfHour,
  isBefore,
  startOfDay,
  endOfDay,
  isValid,
} from 'date-fns';
import { Op } from 'sequelize';
import Meetup from '../models/Meetup';

class MeetupController {
  async index(req, res) {
    const { date, page } = req.query;

    if (page === undefined || page <= 0 || !isValid(parseISO(date))) {
      return res.status(401).json('Data provided are invalid');
    }

    const meetups = await Meetup.findAll({
      where: {
        date: {
          [Op.between]: [startOfDay(parseISO(date)), endOfDay(parseISO(date))],
        },
      },
      limit: 10,
      offset: (page - 1) * 10,
    });
    return res.json(meetups);
    // return res.json(meetups);
  }

  /**
   * Lits os meetups que o usuário logado criou
   */
  async organizerList(req, res) {
    const user_id = req.userId;

    const meetups = await Meetup.findAll({
      where: { user_id },
    });

    return res.json(meetups);
  }

  /**
   * Cadastra um novo evento
   * @param {*} req
   * @param {*} res
   */
  async store(req, res) {
    const {
      avatar_id,
      title,
      description,
      address,
      number,
      city,
      uf,
      date,
    } = req.body;

    const parsedDate = parseISO(date); // converte a data GMT -3:00 para a hora corrreta

    if (!isAfter(parsedDate, new Date())) {
      return res.status(401).json({
        error: 'Date provided must bigger that current date',
      });
    }

    // const checkMeetupExists = await Meetup.findOne({
    //   where: {
    //     date: {
    //       [Op.between]: [startOfHour(parsedDate), endOfHour(parsedDate)],
    //     },
    //   },
    // });

    // if (checkMeetupExists) {
    //   return res.status(401).json({ error: 'Date already exists' });
    // }

    // return res.json({ ok: 'OK' });

    const meetup = await Meetup.create({
      user_id: req.userId,
      avatar_id,
      title,
      description,
      address,
      number,
      city,
      uf,
      date,
    });

    return res.json(meetup);
  }

  /**
   * Atualiza o meetup, somente se o usuário logado for o organizador do evento
   * @param {* Dados para atualizar o meetup} req
   * @param {* Se tudo ocorrer bem, resultará o json dos dados} res
   */
  async update(req, res) {
    const {
      avatar_id,
      title,
      description,
      address,
      number,
      uf,
      city,
      date,
    } = req.body;

    const { id } = req.params;

    // #region Validate fields

    const parsedDate = parseISO(date); // converte a data GMT -3:00 para a hora corrreta

    if (!isAfter(parsedDate, new Date())) {
      return res.status(401).json({
        error: 'Date provided must bigger that current date',
      });
    }

    const checkMeetupExists = await Meetup.findOne({
      where: {
        date: {
          [Op.between]: [startOfHour(parsedDate), endOfHour(parsedDate)],
        },
        id: {
          [Op.ne]: [id],
        },
      },
    });

    if (checkMeetupExists) {
      return res.status(401).json({ error: 'Date already exists' });
    }

    // #endregion

    // #region Verifica se o usuáro logado é o arganizador do envento

    const checkMeetup = await Meetup.findOne({
      where: { id, user_id: req.userId },
    });

    if (!checkMeetup) {
      return res.json({
        error: 'The user logged is not the organizer this event.',
      });
    }

    // Verifica se o evento já aconteceu
    // parsedDate = parseISO(checkMeetup.date); // converte a data GMT -3:00 para a hora corrreta
    const parsedDateNew = parseISO(date);

    const limitDate = subHours(checkMeetup.date, 2);

    if (!isBefore(new Date(), limitDate)) {
      return res.status(401).json({
        error:
          'This event can not be changed, becouse two hours left to start event',
      });
    }

    if (isAfter(parsedDateNew, parsedDate)) {
      checkMeetup.date = date;
      // return res.status(401).json({
      //   error: 'Date provided must bigger than stored date',
      // });
    }

    checkMeetup.title = title;
    checkMeetup.description = description;
    checkMeetup.address = address;
    checkMeetup.number = number;
    checkMeetup.city = city;
    checkMeetup.uf = uf;
    checkMeetup.avatar_id = avatar_id;
    checkMeetup.save();

    return res.json(checkMeetup);
  }

  async delete(req, res) {
    const user_id = req.userId;
    const { id } = req.params;

    const meetup = await Meetup.findOne({
      where: { user_id, id },
    });

    if (!isBefore(new Date(), meetup.date)) {
      return res
        .status(401)
        .json({ error: 'This event can not be deleted after event date' });
    }

    await meetup.destroy();

    return res.status(200).json({ ok: 'Meetup deleted with sucessfull' });
  }
}

export default new MeetupController();
