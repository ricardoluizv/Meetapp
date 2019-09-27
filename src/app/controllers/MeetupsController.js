import Meetup from '../models/Meetup';

class MeetupController {
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

    console.log(`avatarID: ${avatar_id}`);
    console.log(`userID: ${req.userId}`);

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
}

export default new MeetupController();
