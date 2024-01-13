import express from 'express';
import alerts from './routers/alerts';
import users from './routers/users';

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
    this._application.use(express.json());
  }

  private setupRouters() {
    this._application.use('/users', users);
    this._application.use('/alerts', alerts);
  }

  private setupBottomMiddlewares() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this._application.use((error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
      console.log(error);
    
      return response.status(500).json({ message: 'Internal Server Error' });
    });
  }
}

