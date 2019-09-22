import User from '../models/User';

class UserController {
  async store(req, res) {
    const { id, name, email } = await User.create(req.body);
    return res.json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    const { email, oldPassword } = req.body;
    // if (oldPassword && !(await user.checkPassword(oldPassword))) {
    //   return res.status(401).json({ error: 'Password dos not match' });
    // }
    return res.json({
      email,
      oldPassword,
    });
  }
}

export default new UserController();
