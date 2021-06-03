import { getRepository } from 'typeorm';
import { ArticuloInsumo } from '../entity/articuloInsumo';
import { ArticuloManufacturado } from '../entity/articuloManufacturado';
import { Cliente } from '../entity/cliente';
import { DetallePedido } from '../entity/detalle-pedido';
import { EstadoPedido } from '../entity/estadoPedido';
import { Pedido } from '../entity/pedido';
import { Stock } from '../entity/stock';
import { User } from '../entity/user';

class PedidoService {
  async realizarPedido(pedido: any) {
    const nuevoPedido = new Pedido();
    nuevoPedido.fechaPedido = new Date();
    nuevoPedido.horaEstimadaFin = pedido.horaEstimadaFin;
    nuevoPedido.tipoEnvio = pedido.tipoEnvio;
    nuevoPedido.total = pedido.detallePedidos.reduce((acc: any, detallePedido: any) => acc + detallePedido.cantidad, 0);
    return nuevoPedido;
  }

  async agregarArticuloCarrito(carrito: any) {
    try {
      const usuario = await getRepository(User).findOne({
        where: { nombreUsuario: carrito.nombreUsuario, fechaBaja: null },
      });
      if (!usuario) {
        return { mensaje: 'Usuario no encontrado en el sistema.', status: 400 };
      }
      // Primero debemos buscar si el cliente ya agrego algun articulo al carrito. Debemos buscar un pedido que se encuentre Pendiente.
      // En caso de no encontrar, iniciamos un nuevo pedido con estado Pendiente.
      const nuevoPedido:any = new Pedido();
      nuevoPedido.estado = await getRepository(EstadoPedido).findOne({ where: { nombre: 'PENDIENTE' } });
      nuevoPedido.cliente = await getRepository(Cliente).findOne({ where: { usuario } });
      // La hora estimadaFin y total lo calculamos y guardamos en base a lo que vaya agregando al carrito con respecto a lo que ya tiene cargado previamente
      nuevoPedido.horaEstimadaFin = 0;
      nuevoPedido.total = 0;
      // Por cada articulo agregado, creamos un detalle de pedido.
      //Si el articulo es un ArticuloInsumo de tipo esInsumo false, (por ejemplo: Gaseosas) debemos ingresar directamente al detalle.
      const articuloNoInsumo:any = await getRepository(ArticuloInsumo).findOne({
        where: { denominacion: carrito.articulo.nombre, fechaBaja: null },
      });
      if (articuloNoInsumo?.esInsumo) {
        const detallePedido = new DetallePedido();
        detallePedido.articulo = articuloNoInsumo;
        detallePedido.cantidad = carrito.articulo.cantidad;
        detallePedido.subtotal = articuloNoInsumo.precioVenta * carrito.articulo.cantidad;
        //Antes de guardar en la base de datos, ya vamos calculando el total del pedido en base a los articulos que vamos agregando.
        nuevoPedido.total = nuevoPedido.total = detallePedido.subtotal;
        await getRepository(DetallePedido).save(detallePedido);
      } else {
        //En caso de que el articulo es de insumo, es decir un manufacturado (ejemplo: Pizza). Debemos proceder a verificar su stock, tiempo estimado,etc.
        const articuloManufacturado:any = await getRepository(ArticuloManufacturado).findOne({
          where: { denominacion: carrito.articulo.nombre, fechaBaja: null },
        });
        // Si este articulo no es insumo y tampoco es manufacturado, entonces no debe existir. Se debe devolver respuesta.
        if (!articuloManufacturado) {
          return { mensaje: 'El articulo seleccionado no existe.', status: 400 };
        }
        // El articulo se puede cocinar?, hay stock de insumos?
        const cumpleValidacion = this.verificaciones(articuloManufacturado);
        if (!cumpleValidacion) {
          return {
            mensaje: 'No hay stock suficiente para poder realizar este articulo, por favor ingrese otro al carrito.',
            status: 400,
          };
        }
        // Si cumple con la validacion procedemos a crear el detalle del pedido.
        const detallePedido:any = new DetallePedido();
        detallePedido.articuloManufacturado = articuloManufacturado;
        detallePedido.cantidad = carrito.articulo.cantidad;
        detallePedido.subtotal = articuloManufacturado.precioVenta * carrito.articulo.cantidad;
        // Antes de guardar en la base de datos, ya vamos calculando el total del pedido en base a los articulos que vamos agregando.
        nuevoPedido.total = nuevoPedido.total = detallePedido.subtotal;
        // Tambien calculamos el tiempo estimado.
        nuevoPedido.horaEstimadaFin = nuevoPedido.horaEstimadaFin + articuloManufacturado.tiempoEstimadoCocina;
        await getRepository(DetallePedido).save(detallePedido);
      }
      await getRepository(Pedido).save(nuevoPedido);
    } catch (error) {
      return { error, status: 400 };
    }
  }

  // Este metodo permite verificar si el articulo manufacturado seleccionado cumple, que sus insumos tengan stock minimo para poder cocinarse.
  // Simplemente suponemos que todos sus articulos insumos tienen stock, se valida si cada uno la cantidad es menor a la del stock minimo.
  // En caso de almenos uno cumpla con la validacion, el booleano pasa a falso y no se puede agregar el articulo al carrito.
  async verificaciones(articuloManufacturado: ArticuloManufacturado): Promise<boolean> {
    const articulosInsumo:any = await getRepository(ArticuloInsumo).find({ where: { articuloManufacturado } });
    let tieneStock = true;
    await Promise.all(
      articulosInsumo.map(async (articuloInsumo:any) => {
        if (articuloInsumo.stock.cantidad < articuloInsumo.stock.stockMinimo) {
          tieneStock = false;
        }
      })
    );
    return tieneStock;
  }
}

export default new PedidoService();
