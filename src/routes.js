import { Router } from 'express';
import UserController from './app/controllers/UserController';

const routes = new Router();

// routes.get('/', async (req, res) => {
//   const user = await User.create({
//     name: 'Teobaldo',
//     email: 'teobaldo@gmail.com',
//     password_hash: '123456',
//   });
//   return res.json(user);
// });

routes.post('/users', UserController.store);

// routes.post('/users', (req, res) => {
//   console.log(req.body);

//   const { name, email, password } = req.body;

//   return res.json(name, email, password);
// });

export default routes;
