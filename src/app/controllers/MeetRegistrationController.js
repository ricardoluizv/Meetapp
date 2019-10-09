import { isAfter, format, subHours } from 'date-fns';
import pt from 'date-fns/locale';
import { Op } from 'sequelize';

import MeetRegistration from '../models/MeetRegistration';
import Meetup from '../models/Meetup';

import Mail from '../../lib/Mail';
import User from '../models/User';

class MeetRegistrationController {
  async index(req, res) {
    const user_id = req.userId;

    const meetupRegistered = await MeetRegistration.findAll({
      where: {
        user_id,
        '$meetups.date$': { [Op.gt]: subHours(new Date(), 3) }, // meetups.date > data_atual
      },
      include: [
        {
          model: Meetup,
          as: 'meetups',
        },
      ],
      order: [[{ model: Meetup, as: 'meetups' }, 'date', 'DESC']],
    });

    return res.json(meetupRegistered);
  }

  async store(req, res) {
    const user_id = req.userId;
    const { meetup_id } = req.params;

    const checkMeetup = await Meetup.findOne({
      where: { user_id, id: meetup_id },
    });

    if (checkMeetup) {
      return res.status(401).json({
        error: 'This user opened this meetup and can no register this meet',
      });
    }

    const meetup = await Meetup.findByPk(meetup_id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (!meetup) {
      return res.status(401).json({
        error: 'This meetup can no be found',
      });
    }

    if (isAfter(new Date(), meetup.date)) {
      return res.status(401).json({
        error: 'This meetup you can no more regiter',
      });
    }

    const meetRegistration = await MeetRegistration.findOne({
      where: {
        user_id,
        meetup_id,
      },
    });

    if (meetRegistration) {
      return res.status(401).json({
        error: 'This user is registered already',
      });
    }

    await MeetRegistration.create({
      meetup_id,
      user_id,
    });

    const loginUser = await User.findByPk(user_id);

    await Mail.sendMail({
      to: `${meetup.user.name} <${meetup.user.email}>`,
      subject: `Um novo usuário resgistrou no evento`,
      template: 'register',
      context: {
        username: meetup.user.name,
        username_register: loginUser.name,
        meetup_title: meetup.title,
        meetup_date: format(
          meetup.date,
          `'${meetup.city}', dd 'de' MMMM', às' H:mm'h'`,
          {
            locale: pt,
          }
        ),
      },
      // text: `Você tem um novo usuário registrado ao evento`,
    });

    return res.json({ ok: 'ok' });
  }
}

export default new MeetRegistrationController();
