import { Router, Request, Response } from 'express';
import EstadosPedido from '../enumerables/estados-pedidos.enum';
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
    this.route.post('/aprobar-pedido/:numeroPedido', this.aprobarPedido.bind(this));
    this.route.post('/rechazar-pedido/:numeroPedido', this.rechazarPedido.bind(this));
    this.route.post('/finalizar-pedido/:numeroPedido', this.finalizarPedido.bind(this));
    this.route.post('/enviar-delivery-pedido/:numeroPedido', this.enviarDelivery.bind(this));
    this.route.post('/facturar-pedido/:numeroPedido', this.facturarPedido.bind(this));
    this.route.get('/obtener-pedidos-pendiente', this.obtenerPedidosPendientes.bind(this));
    this.route.get('/obtener-pedidos-finalizado', this.obtenerPedidosFinalizados.bind(this));
    this.route.get('/obtener-pedidos-aprobado', this.obtenerPedidosAprobados.bind(this));
    this.route.get('/obtener-pedidos-delivery', this.obtenerPedidosDelivery.bind(this));
    this.route.get('/obtener-pedidos-facturado', this.obtenerPedidosFacturado.bind(this));
  }

  async confirmarPedido(req: Request, res: Response) {
    try {
      const response = await pedidoService.confirmarPedido(Number(req.params.numeroPedido), req.body);
      if (response.status === 400) {
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
  async eliminarArticuloCarrito(req: Request, res: Response) {
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
  async aprobarPedido(req: Request, res: Response) {
    try {
      const error = await pedidoService.aprobarOrechazarPedido(Number(req.params.numeroPedido), EstadosPedido.APROBADO);
      if (error) {
        res.status(400).json(error);
        return;
      }
      res.status(200).json({ mensaje: 'Articulo Aprobado con exito' });
    } catch (error) {
      res.status(500).json({ error, status: 500 });
    }
  }
  async rechazarPedido(req: Request, res: Response) {
    try {
      const error = await pedidoService.aprobarOrechazarPedido(
        Number(req.params.numeroPedido),
        EstadosPedido.RECHAZADO
      );
      if (error) {
        res.status(400).json(error);
        return;
      }
      res.status(200).json({ mensaje: 'Articulo Recahzado con exito' });
    } catch (error) {
      res.status(500).json({ error, status: 500 });
    }
  }
  async finalizarPedido(req: Request, res: Response) {
    try {
      const error = await pedidoService.finalizarPedido(Number(req.params.numeroPedido), EstadosPedido.TERMINADO);
      if (error) {
        res.status(400).json(error);
        return;
      }
      res.status(200).json({ mensaje: 'Articulo finalizado con exito' });
    } catch (error) {
      res.status(500).json({ error, status: 500 });
    }
  }
  async enviarDelivery(req: Request, res: Response) {
    try {
      const error = await pedidoService.enviarDelivery(Number(req.params.numeroPedido), EstadosPedido.EN_DELIVERY);
      if (error) {
        res.status(400).json(error);
        return;
      }
      res.status(200).json({ mensaje: 'Articulo en estado Delivery seteado con exito' });
    } catch (error) {
      res.status(500).json({ error, status: 500 });
    }
  }

  async facturarPedido(req: Request, res: Response) {
    try {
      const error = await pedidoService.facturarPedido(Number(req.params.numeroPedido), EstadosPedido.FACTURADO);
      if (error) {
        res.status(400).json(error);
        return;
      }
      res.status(200).json({ mensaje: 'Articulo facturado con exito' });
    } catch (error) {
      res.status(500).json({ error, status: 500 });
    }
  }

  async obtenerPedidosPendientes(req: Request, res: Response) {
    try {
      const response = await pedidoService.obtenerPedidos(EstadosPedido.PENDIENTE);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json(error);
    }
  }
  async obtenerPedidosFinalizados(req: Request, res: Response) {
    try {
      const response = await pedidoService.obtenerPedidos(EstadosPedido.TERMINADO);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json(error);
    }
  }
  async obtenerPedidosAprobados(req: Request, res: Response) {
    try {
      const response = await pedidoService.obtenerPedidos(EstadosPedido.APROBADO);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json(error);
    }
  }
  async obtenerPedidosDelivery(req: Request, res: Response) {
    try {
      const response = await pedidoService.obtenerPedidos(EstadosPedido.EN_DELIVERY);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json(error);
    }
  }
  async obtenerPedidosFacturado(req: Request, res: Response) {
    try {
      const response = await pedidoService.obtenerPedidos(EstadosPedido.FACTURADO);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}
export default new PedidoRoute().route;
