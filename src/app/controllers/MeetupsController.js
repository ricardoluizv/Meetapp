import {
  // startOfDay,
  // endOfDay,
  parseISO,
  isAfter,
  // format,
  startOfHour,
  endOfHour,
} from 'date-fns';
import { Op } from 'sequelize';
import { da } from 'date-fns/locale';
import Meetup from '../models/Meetup';

class MeetupController {
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
      uf,
      date,
    } = req.body;

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
      },
    });

    if (checkMeetupExists) {
      return res.status(401).json({ error: 'Date already exists' });
    }

    // return res.json({ ok: 'OK' });

    const meetup = await Meetup.create({
      user_id: req.userId,
      avatar_id,
      title,
      description,
      address,
      number,
      uf,
      date,
    });

    return res.json(meetup);
  }

  /**
   *Atualiza o meetup, somente se o usuário logado for o organizador do evento
   * @param {* Dados para atualizar o meetup} req
   * @param {* Se tudo ocorrer bem, resultará o json dos dados} res
   */
  async update(req, res) {
    const {
      id,
      avatar_id,
      title,
      description,
      address,
      number,
      uf,
      date,
    } = req.body;

    // #region Validate fields

    let parsedDate = parseISO(date); // converte a data GMT -3:00 para a hora corrreta

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
    if (checkMeetup.date <= date) {
      return res.json({
        error: `The date provided must be begger than ${checkMeetup.date}`,
      });
    }

    parsedDate = parseISO(checkMeetup.date); // converte a data GMT -3:00 para a hora corrreta
    const parsedDateNew = parseISO(date);

    if (!isAfter(parsedDateNew, parsedDate)) {
      return res.status(401).json({
        error: 'Date provided must bigger than stored date',
      });
    }

    checkMeetup.title = title;
    checkMeetup.description = description;
    checkMeetup.address = address;
    checkMeetup.number = number;
    checkMeetup.uf = uf;
    checkMeetup.date = date;
    checkMeetup.avatar_id = avatar_id;
    checkMeetup.save();

    return res.json(checkMeetup);
  }
}

export default new MeetupController();
