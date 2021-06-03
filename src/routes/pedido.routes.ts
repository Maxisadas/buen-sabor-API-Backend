import { Router, Request, Response } from 'express';
import pedidoService from '../services/pedido.service';

class PedidoRoute {
  public route = Router();

  constructor() {
    this.createRoutes();
  }

  createRoutes(): void {
    this.route.post('/realizar-pedido', this.realizarPedido.bind(this));
    //Aca debe ir la ruta para poder llamar al servicio de actualizar Clientes
    this.route.post('/agregar-carrito', this.agregarArticuloCarrito.bind(this));
  }

  async realizarPedido(req: Request, res: Response) {
    try {
      const response = await pedidoService.realizarPedido(req.body);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error, status: 500 });
    }
  }
  async agregarArticuloCarrito(req: Request, res: Response) {
    try {
      const error = await pedidoService.agregarArticuloCarrito(req.body);
      if (error) {
        res.status(400).json(error);
        return;
      }
      res.status(200).json({ mensaje: 'Articulo Agregado con exito' });
    } catch (error) {
      res.status(500).json({ error, status: 500 });
    }
  }
}
export default new PedidoRoute().route;
