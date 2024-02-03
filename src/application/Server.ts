import express from 'express';
import alerts from './routers/alerts';
import users from './routers/users';
import test from './routers/test';
import mustache_express from 'mustache-express';
import cors from 'cors';
import { join } from 'path';

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
    this._application.set('view engine', 'mustache');
    this._application.engine('mustache', mustache_express());
  }

  private setupRouters() {
    this._application.get('/', (_, response) => {
      response.redirect('/views/index');
    });

    this._application.use('/api', users, alerts);
    this._application.use('/views', test);
  }

  private setupBottomMiddlewares() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this._application.use((error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
      console.log(error);

      return response.status(500).json({ message: 'Internal Server Error' });
    });
  }
}

