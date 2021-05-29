import { Router, Request, Response } from 'express';
import clienteService from '../services/cliente.service';

class ClienteRoute {
  public route = Router();

  constructor() {
    this.createRoutes();
  }

  createRoutes(): void {
    this.route.get('/clientes', this.getClientes.bind(this));
  }

  async getClientes(req: Request, res: Response) {
    try {
      const response = await clienteService.getClientes();
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}
export default new ClienteRoute().route;
