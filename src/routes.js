import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';
import FileController from './app/controllers/FileController';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import authMiddleware from './app/middlewares/auth';
import MeetupsController from './app/controllers/MeetupsController';
import MeetRegistrationController from './app/controllers/MeetRegistrationController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);
routes.post('/files', upload.single('file'), FileController.store);

// #region Meetups

routes.post('/meetups', MeetupsController.store);
routes.put('/meetups/:id', MeetupsController.update);
// Lista os eventos que o usuário logado abriu
routes.get('/organizer/meetups', MeetupsController.organizerList);
// Apaga os eventos que o usuário logado posui
routes.delete('/meetups/:id', MeetupsController.delete);
// Resitrar em um evento
routes.post('/meetups/:meetup_id/register', MeetRegistrationController.store);

routes.get('/meetups', MeetupsController.index);
// #endregion

export default routes;
