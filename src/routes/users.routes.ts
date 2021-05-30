import { Router, Request, Response } from 'express';
import usersService from '../services/users.service';

class UsersRoute {
  public router = Router();

  constructor() {
    this.createRoutes();
  }

  createRoutes(): void {
    this.router.get('/users', this.getUsers.bind(this));
    this.router.post('/users', this.createUsers.bind(this));
    this.router.delete('/users/:id', this.deleteUser.bind(this));
  }

  async getUsers(req: Request, res: Response) {
    try {
      const response = await usersService.getUsers();
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async createUsers(req: Request, res: Response) {
    if (!req.body.nombreUsuario || !req.body.rolUsuario || !req.body.contrasena) {
      return res.status(400).json({ mensaje: 'Por favor ingrese todos los datos requeridos', status: 400 });
    }
    try {
      const response = await usersService.createUser(req.body);
      if (response?.status === 400) {
        return res.status(response?.status).json(response);
      }
      res.status(200).json({ mensaje: 'Usuario creado satisfactoriamente' });
    } catch (err) {
      res.status(500).json({ mensaje: 'Hubo un problema en la creación de usuario', err, status: 500 });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const response = await usersService.deleteUser(req.params.id);
      if (response?.status === 400) {
        return res.status(response?.status).json(response);
      }
      res.status(200).json({ mensaje: 'El Usuario ha sido dado de baja exitosamente' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Hubo un problema en la creación de usuario', error, status: 500 });
    }
  }
}

export default new UsersRoute().router;
