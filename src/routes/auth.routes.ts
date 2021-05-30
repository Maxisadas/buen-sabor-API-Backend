import { Router, Request, Response } from 'express';
import authService from '../services/auth.service';

class AuthRoutes {
  public router = Router();

  constructor() {
    this.createRoutes();
  }

  createRoutes(): void {
    this.router.post('/login', this.login.bind(this));
  }

  async login(req: Request, res: Response) {
    if (!req.body.nombreUsuario || !req.body.contrasena) {
      return res.status(400).json({ mensaje: 'Por favor ingrese todos los datos requeridos', status: 400 });
    }
    try {
      const response = await authService.login(req.body);
      if (response.status === 400) {
        return res.status(400).json(response);
      }
      res.status(200).json({ response });
    } catch (err) {
      res.status(500).json({ mensaje: 'Hubo un problema en la creación de usuario', err, status: 500 });
    }
  }
}

export default new AuthRoutes().router;
