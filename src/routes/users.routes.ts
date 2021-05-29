import { Router, Request, Response } from 'express';
import usersService from '../services/users.service';

class UsersRoute {
  public router = Router();

  constructor() {
    this.createRoutes();
  }

  createRoutes(): void {
    this.router.get('/users', this.getUsers.bind(this));
  }

  getUsers(req: Request, res: Response) {
    usersService
      .getUsers()
      .then((response) => res.status(200).json(response))
      .catch((err) => res.status(500).json(err));
  }
}

export default new UsersRoute().router;
