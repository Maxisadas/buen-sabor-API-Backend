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

  async getUsers(req: Request, res: Response) {
    try {
      const response = await usersService.getUsers();
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

export default new UsersRoute().router;
