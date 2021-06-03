import { Router, Request, Response } from 'express';
import configuracionService from '../services/configuracion.service';

class ConfiguracionRoute {
  public route = Router();

  constructor() {
    this.createRoutes();
  }

  createRoutes(): void {
    this.route.post('/configuracion', this.saveConfig.bind(this));
    this.route.get('/configuracion', this.getConfig.bind(this));
    //Aca debe ir la ruta para poder llamar al servicio de actualizar Clientes
  }

  async saveConfig(req: Request, res: Response) {
    try {
      configuracionService.saveConfig(req.body);
      res.status(200).json({ mensaje: 'La configuracion ha sido guardada con exito' });
    } catch (error) {
      res.status(500).json({ error, status: 500 });
    }
  }
  async getConfig(req: Request, res: Response) {
    try {
      const response = await configuracionService.getConfig();
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error, status: 500 });
    }
  }
}
export default new ConfiguracionRoute().route;
