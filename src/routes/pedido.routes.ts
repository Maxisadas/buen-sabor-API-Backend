import { Router, Request, Response } from 'express';
import pedidoService from '../services/pedido.service';

class PedidoRoute {
  public route = Router();

  constructor() {
    this.createRoutes();
  }

  createRoutes(): void {
    this.route.post('/confirmar-pedido/:numeroPedido', this.confirmarPedido.bind(this));
    this.route.post('/agregar-articulo', this.agregarArticuloCarrito.bind(this));
    this.route.post('/eliminar-articulo', this.eliminarArticuloCarrito.bind(this));
  }

  async confirmarPedido(req: Request, res: Response) {
    try {
      const response = await pedidoService.confirmarPedido(Number(req.params.numeroPedido),req.body);
      if(response.status === 400){
        res.status(400).json(response);
        return;
      }
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
  async eliminarArticuloCarrito(req: Request, res: Response){
    try {
      const error = await pedidoService.eliminarArticuloCarrito(req.body);
      if (error) {
        res.status(400).json(error);
        return;
      }
      res.status(200).json({ mensaje: 'Articulo eliminado con exito' });
    } catch (error) {
      res.status(500).json({ error, status: 500 });
    }
  }
}
export default new PedidoRoute().route;
