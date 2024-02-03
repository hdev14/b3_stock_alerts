import cors from 'cors';
import express from 'express';
import mustache_express from 'mustache-express';
import { join } from 'path';
import error_handler from './middlewares/error_handler';
import alerts from './routers/alerts';
import users from './routers/users';
import views from './routers/views';

export default class Server {
  private _application: express.Application;

  constructor() {
    this._application = express();
    this.setupTopMiddlewares();
    this.setupRouters();
    this.setupBottomMiddlewares();
  }

  get application() {
    return this._application;
  }

  private setupTopMiddlewares() {
    this._application.use(cors());
    this._application.use(express.json());
    this._application.set('views', join(__dirname, 'views'));
    this._application.set('view engine', 'html');
    this._application.engine('html', mustache_express(join(__dirname, 'views/partials')));
  }

  private setupRouters() {
    this._application.use('/api', users, alerts);
    this._application.use('/views', views);
    this._application.get('/', (_, response) => {
      response.redirect('/views/index');
    });
  }

  private setupBottomMiddlewares() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this._application.use(error_handler);
  }
}

