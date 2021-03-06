import { getRepository } from 'typeorm';
import { ArticuloInsumo } from '../entity/articuloInsumo';
import { ArticuloManufacturado } from '../entity/articuloManufacturado';
import { ArticuloManufacturadoDetalle } from '../entity/articuloManufacturadoDetalle';
import { Cliente } from '../entity/cliente';
import { DetalleFactura } from '../entity/detalle-factura';
import { DetallePedido } from '../entity/detalle-pedido';
import { EstadoPedido } from '../entity/estadoPedido';
import { Factura } from '../entity/factura';
import { MercadoPagoDatos } from '../entity/mercadoPagoDatos';
import { Pedido } from '../entity/pedido';
import { User } from '../entity/user';
import EstadosPedido from '../enumerables/estados-pedidos.enum';
import FormaPago from '../enumerables/formaPago.enum';
import TiposEnvios from '../enumerables/tiposEnvios.enum';

class PedidoService {
  async confirmarPedido(numeroPedido: number, informacionPago: any) {
    const usuario = await getRepository(User).findOne({
      where: { nombreUsuario: informacionPago.nombreUsuario, fechaBaja: null },
    });
    if (!usuario) {
      return { mensaje: 'Usuario no encontrado en el sistema.', status: 400 };
    }
    const creado = await getRepository(EstadoPedido).findOne({ where: { nombre: 'CREADO' } });
    const pedidoEncontrado = await getRepository(Pedido).findOne({ numeroPedido, estado: creado });
    if (!pedidoEncontrado) {
      return { mensaje: 'El pedido no se ha encontrado en nuestro sistema', status: 400 };
    }
    pedidoEncontrado.fechaPedido = new Date();
    pedidoEncontrado.tipoEnvio = informacionPago.tipoEnvio;
    const pendiente = await getRepository(EstadoPedido).findOne({ where: { nombre: 'PENDIENTE' } });
    pedidoEncontrado.estado = pendiente;
    if (informacionPago.tipoEnvio === TiposEnvios.DELIVERY) {
      pedidoEncontrado.horaEstimadaFin = pedidoEncontrado.horaEstimadaFin + 0.1; // Por la demora del delivery
      await getRepository(Pedido).save(pedidoEncontrado);
    }
    if (informacionPago.tipoEnvio === TiposEnvios.RETIRO_LOCAL) {
      pedidoEncontrado.total = pedidoEncontrado.total - pedidoEncontrado.total * 0.1; // Descuento del 10% si retira el pedido en el local
    }
    // Procesar pago... EN CONSTRUCCION.
    await getRepository(Pedido).save(pedidoEncontrado);
    return {
      mensaje: 'Su pedido ha sido confirmado con exito, se debe esperar la aprobaci??n por parte de nuestro personal.',
    };
  }

  // La logica que se sigue es la siguiente, nuestro concepto de Carrito viene de la creaci??n de un pedido con estado "CREADO"
  // es decir un pedido con estado "CREADO" es el carrito, un usuario SIEMPRE debe tener solo 1 pedido con estado "CREADO" es decir 1 carrito.
  async agregarArticuloCarrito(carrito: any) {
    try {
      const usuario = await getRepository(User).findOne({
        where: { nombreUsuario: carrito.nombreUsuario, fechaBaja: null },
      });
      if (!usuario) {
        return { mensaje: 'Usuario no encontrado en el sistema.', status: 400 };
      }
      const cliente = await getRepository(Cliente).findOne({ where: { usuario } });
      // Primero debemos buscar si el cliente ya agrego algun articulo al carrito. Debemos buscar un pedido que se encuentre CREADO.
      const creado = await getRepository(EstadoPedido).findOne({ where: { nombre: 'CREADO' } });
      const pedidoExistente = await getRepository(Pedido).findOne({ where: { cliente, estado: creado } });
      if (pedidoExistente) {
        this.agregarMasArticulosAlCarrito(carrito, pedidoExistente);
        return;
      }
      // En caso de no encontrar, iniciamos un nuevo pedido con estado Creado.
      const nuevoPedido: any = new Pedido();
      nuevoPedido.estado = creado;
      nuevoPedido.cliente = await getRepository(Cliente).findOne({ where: { usuario } });
      // La hora estimadaFin y total lo calculamos y guardamos en base a lo que vaya agregando al carrito con respecto a lo que ya tiene cargado previamente
      nuevoPedido.horaEstimadaFin = 0;
      nuevoPedido.total = 0;
      const pedido = await getRepository(Pedido).save(nuevoPedido);
      // Por cada articulo agregado, creamos un detalle de pedido.
      //Si el articulo es un ArticuloInsumo de tipo esInsumo false, (por ejemplo: Gaseosas) debemos ingresar directamente al detalle.
      const articuloNoInsumo: any = await getRepository(ArticuloInsumo).findOne({
        where: { denominacion: carrito.articulo.nombre, fechaBaja: null },
      });
      if (articuloNoInsumo && !articuloNoInsumo?.esInsumo) {
        const detallePedido = new DetallePedido();
        detallePedido.articulo = articuloNoInsumo;
        detallePedido.cantidad = carrito.articulo.cantidad;
        detallePedido.subtotal = articuloNoInsumo.precioVenta * carrito.articulo.cantidad;
        //Antes de guardar en la base de datos, ya vamos calculando el total del pedido en base a los articulos que vamos agregando.
        nuevoPedido.total = nuevoPedido.total + detallePedido.subtotal;
        detallePedido.pedido = nuevoPedido;
        await getRepository(DetallePedido).save(detallePedido);
        await getRepository(Pedido).save(pedido);
      } else {
        //En caso de que el articulo es de insumo, es decir un manufacturado (ejemplo: Pizza). Debemos proceder a verificar su stock, tiempo estimado,etc.
        const articuloManufacturado: any = await getRepository(ArticuloManufacturado).findOne({
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
            mensaje: 'No hay stock suficiente para poder preparar este plato, por favor ingrese otro al carrito.',
            status: 400,
          };
        }
        // Si cumple con la validacion procedemos a crear el detalle del pedido.
        const detallePedido = new DetallePedido();
        detallePedido.articuloManufacturado = articuloManufacturado;
        detallePedido.cantidad = carrito.articulo.cantidad;
        detallePedido.subtotal = articuloManufacturado.precioVenta * carrito.articulo.cantidad;
        // Antes de guardar en la base de datos, ya vamos calculando el total del pedido en base a los articulos que vamos agregando.
        nuevoPedido.total = nuevoPedido.total + detallePedido.subtotal;
        // Tambien calculamos el tiempo estimado.
        nuevoPedido.horaEstimadaFin = nuevoPedido.horaEstimadaFin + articuloManufacturado.tiempoEstimadoCocina;
        detallePedido.pedido = nuevoPedido;
        await getRepository(DetallePedido).save(detallePedido);
        await getRepository(Pedido).save(pedido);
      }
    } catch (error) {
      return { error, status: 500 };
    }
  }

  // Este metodo permite verificar si el articulo manufacturado seleccionado cumple, que sus insumos tengan stock minimo para poder cocinarse.
  // Simplemente suponemos que todos sus articulos insumos tienen stock, se valida si cada uno la cantidad es menor a la del stock minimo.
  // En caso de almenos uno cumpla con la validacion, el booleano pasa a falso y no se puede agregar el articulo al carrito.
  private async verificaciones(articuloManufacturado: ArticuloManufacturado): Promise<boolean> {
    const Detallesarticulos = await getRepository(ArticuloManufacturadoDetalle).find({
      where: { articuloManufacturado },
    });
    let tieneStock = true;
    await Promise.all(
      //Validamos si el articulo cumple con el stock minimo
      Detallesarticulos.map(async (detalleArticulo: any) => {
        if (detalleArticulo.articuloInsumo.stock.cantidad < detalleArticulo.articuloInsumo.stock.stockMinimo) {
          tieneStock = false;
          return;
        }
      })
    );
    return tieneStock;
  }

  private async agregarMasArticulosAlCarrito(carrito: any, pedidoExistente: any) {
    // Por cada articulo agregado, creamos un detalle de pedido.
    //Si el articulo es un ArticuloInsumo de tipo esInsumo false, (por ejemplo: Gaseosas) debemos ingresar directamente al detalle.
    const articuloNoInsumo: any = await getRepository(ArticuloInsumo).findOne({
      where: { denominacion: carrito.articulo.nombre, fechaBaja: null },
    });
    // Si el articulo seleccionado ya existe en el carrito es decir existe un detallePedido con el articulo seleccionado, simplemente le sumamos 1 a la cantidad.
    const articuloNoInsumoDetalle = await getRepository(DetallePedido).findOne({
      where: { pedido: pedidoExistente, articulo: articuloNoInsumo },
    });
    if (articuloNoInsumoDetalle) {
      await this.incrementarCantidad(pedidoExistente, articuloNoInsumoDetalle, carrito);
      return;
    }
    if (articuloNoInsumo && !articuloNoInsumo?.esInsumo) {
      const detallePedido = new DetallePedido();
      detallePedido.articulo = articuloNoInsumo;
      detallePedido.cantidad = carrito.articulo.cantidad;
      detallePedido.subtotal = articuloNoInsumo.precioVenta * carrito.articulo.cantidad;
      //Antes de guardar en la base de datos, ya vamos calculando el total del pedido en base a los articulos que vamos agregando.
      pedidoExistente.total = pedidoExistente.total + detallePedido.subtotal;
      detallePedido.pedido = pedidoExistente;
      await getRepository(DetallePedido).save(detallePedido);
      await getRepository(Pedido).save(pedidoExistente);
    } else {
      //En caso de que el articulo es de insumo, es decir un manufacturado (ejemplo: Pizza). Debemos proceder a verificar su stock, tiempo estimado,etc.
      const articuloManufacturado: any = await getRepository(ArticuloManufacturado).findOne({
        where: { denominacion: carrito.articulo.nombre, fechaBaja: null },
      });
      // Si el articulo seleccionado ya existe en el carrito es decir existe un detallePedido con el articulo seleccionado, simplemente le sumamos 1 a la cantidad.
      const articuloManufacturaDetalle = await getRepository(DetallePedido).findOne({
        where: { pedido: pedidoExistente, articuloManufacturado: articuloManufacturado },
      });
      if (articuloManufacturaDetalle) {
        await this.incrementarCantidad(pedidoExistente, articuloManufacturaDetalle, carrito);
        return;
      }
      // Si este articulo no es insumo y tampoco es manufacturado, entonces no debe existir. Se debe devolver respuesta.
      if (!articuloManufacturado) {
        return { mensaje: 'El articulo seleccionado no existe.', status: 400 };
      }
      // El articulo se puede cocinar?, hay stock de insumos?
      const cumpleValidacion = this.verificaciones(articuloManufacturado);
      if (!cumpleValidacion) {
        return {
          mensaje: 'No hay stock suficiente para poder preparar este plato, por favor ingrese otro al carrito.',
          status: 400,
        };
      }
      // Si cumple con la validacion procedemos a crear el detalle del pedido.
      const detallePedido: any = new DetallePedido();
      detallePedido.articuloManufacturado = articuloManufacturado;
      detallePedido.cantidad = carrito.articulo.cantidad;
      detallePedido.subtotal = articuloManufacturado.precioVenta * carrito.articulo.cantidad;
      // Antes de guardar en la base de datos, ya vamos calculando el total del pedido en base a los articulos que vamos agregando.
      pedidoExistente.total = pedidoExistente.total + detallePedido.subtotal;
      // Tambien calculamos el tiempo estimado.
      pedidoExistente.horaEstimadaFin = pedidoExistente.horaEstimadaFin + articuloManufacturado.tiempoEstimadoCocina;
      detallePedido.pedido = pedidoExistente;
      await getRepository(DetallePedido).save(detallePedido);
      await getRepository(Pedido).save(pedidoExistente);
    }
  }

  async eliminarArticuloCarrito(carrito: any) {
    try {
      const usuario = await getRepository(User).findOne({
        where: { nombreUsuario: carrito.nombreUsuario, fechaBaja: null },
      });
      if (!usuario) {
        return { mensaje: 'Usuario no encontrado en el sistema.', status: 400 };
      }
      const cliente = await getRepository(Cliente).findOne({ where: { usuario } });
      const creado = await getRepository(EstadoPedido).findOne({ where: { nombre: 'CREADO' } });
      const pedidoExistente = await getRepository(Pedido).findOne({ where: { cliente, estado: creado } });
      if (!pedidoExistente) {
        return { mensaje: 'Usted no tiene agregado ningun articulo, por favor agregue uno', status: 400 };
      }
      // Aca debemos buscar por nombre del articulo, asi que primero buscamos por los articulos insumos. SINO buscamos por los manufacturados.
      let articuloEncontrado: any = await getRepository(ArticuloInsumo).findOne({
        where: { denominacion: carrito.articulo.nombre },
      });
      if (articuloEncontrado) {
        // ES ARTICULO INSUMOS
        const detallePedido = await getRepository(DetallePedido).findOne({
          where: { articulo: articuloEncontrado, pedido: pedidoExistente },
        });
        if (!detallePedido) {
          return { mensaje: 'Usted no ha agregado este articulo al carrito', status: 400 };
        }
        // Si el usuario resta menos cantidad de las que existe, entonces debemos devolver error.
        if (detallePedido.cantidad < carrito.articulo.cantidad) {
          return {
            mensaje: `Existe menos cantidad de productos en el carrito, por favor ingrese la cantidad hasta un maximo de: ${detallePedido.cantidad} unidades`,
            status: 400,
          };
        }
        // Una vez encontrado el detalle, devemos revisar la cantidad, si este llega a 0 o menor , se debe eliminar. Sino solo actualizar.
        const cantidadActualizada = await this.decrementarCantidad(pedidoExistente, detallePedido, carrito);
        if (cantidadActualizada <= 0) {
          await getRepository(DetallePedido).delete(detallePedido);
        }
        return;
      } else {
        // ES ARTICULO MANUFACTURADO
        articuloEncontrado = await getRepository(ArticuloManufacturado).findOne({
          where: { denominacion: carrito.articulo.nombre },
        });
        if (!articuloEncontrado) {
          return { mensaje: 'El articulo no existe en nuestro sistema' };
        }
        const detallePedido: any = await getRepository(DetallePedido).findOne({
          where: { articuloManufacturado: articuloEncontrado, pedido: pedidoExistente },
        });
        if (!detallePedido) {
          return { mensaje: 'Usted no ha agregado este articulo al carrito', status: 400 };
        }
        // Si el usuario resta menos cantidad de las que existe, entonces debemos devolver error.
        if (detallePedido.cantidad < carrito.articulo.cantidad) {
          return {
            mensaje: `Existe menos cantidad de productos en el carrito, por favor ingrese la cantidad hasta un maximo de: ${detallePedido.cantidad} unidades`,
            status: 400,
          };
        }
        // Una vez encontrado el detalle, devemos revisar la cantidad, si este llega a 0 o menor , se debe eliminar. Sino solo actualizar.
        const cantidadActualizada = await this.decrementarCantidad(pedidoExistente, detallePedido, carrito);
        if (cantidadActualizada <= 0) {
          await getRepository(DetallePedido).delete(detallePedido);
        }
        return;
      }
    } catch (error) {
      return { error, status: 500 };
    }
  }

  async incrementarCantidad(pedido: any, pedidoDetalle: any, carrito: any) {
    // Si se trata de un articulo que no es insumo (EJ: Cocacola)
    if (pedidoDetalle.articulo) {
      pedidoDetalle.subtotal = pedidoDetalle.subtotal + pedidoDetalle.articulo.precioVenta * carrito.articulo.cantidad;
      pedido.total = pedido.total + pedidoDetalle.articulo.precioVenta * carrito.articulo.cantidad;
    } else {
      // si se trata de un articulo manufacturado (Ej:pizza)
      pedidoDetalle.subtotal =
        pedidoDetalle.subtotal + pedidoDetalle.articuloManufacturado.precioVenta * carrito.articulo.cantidad;
      pedido.horaEstimadaFin = pedido.horaEstimadaFin + pedidoDetalle.articuloManufacturado.tiempoEstimadoCocina;
      pedido.total = pedido.total + pedidoDetalle.articuloManufacturado.precioVenta * carrito.articulo.cantidad;
    }
    pedidoDetalle.cantidad = pedidoDetalle.cantidad + carrito.articulo.cantidad;
    await getRepository(DetallePedido).save(pedidoDetalle);
    await getRepository(Pedido).save(pedido);
  }

  async decrementarCantidad(pedido: any, pedidoDetalle: any, carrito: any) {
    // Si se trata de un articulo que no es insumo (EJ: Cocacola)
    if (pedidoDetalle.articulo) {
      pedidoDetalle.subtotal = pedidoDetalle.subtotal - pedidoDetalle.articulo.precioVenta * carrito.articulo.cantidad;
      pedido.total = pedido.total - pedidoDetalle.articulo.precioVenta * carrito.articulo.cantidad;
    } else {
      // si se trata de un articulo manufacturado (Ej:pizza)
      pedidoDetalle.subtotal =
        pedidoDetalle.subtotal - pedidoDetalle.articuloManufacturado.precioVenta * carrito.articulo.cantidad;
      pedido.horaEstimadaFin = pedido.horaEstimadaFin - pedidoDetalle.articuloManufacturado.tiempoEstimadoCocina;
      pedido.total = pedido.total - pedidoDetalle.articuloManufacturado.precioVenta * carrito.articulo.cantidad;
    }
    pedidoDetalle.cantidad = pedidoDetalle.cantidad - carrito.articulo.cantidad;
    await getRepository(DetallePedido).save(pedidoDetalle);
    await getRepository(Pedido).save(pedido);
    return pedidoDetalle.cantidad;
  }

  async aprobarOrechazarPedido(nroPedido: number, estado: EstadosPedido) {
    const pendiente = await getRepository(EstadoPedido).findOne({ where: { nombre: EstadosPedido.PENDIENTE } });
    const pedidoEncontrado = await getRepository(Pedido).findOne(nroPedido, { where: { estado: pendiente } });
    if (!pedidoEncontrado) {
      return { mensaje: 'El pedido no se ha encontrado en nuestro sistema', status: 400 };
    }
    const detallesPedido = await getRepository(DetallePedido).find({ where: { pedido: pedidoEncontrado } });
    if (detallesPedido.length <= 0) {
      return { mensaje: 'El pedido no contiene articulos', status: 400 };
    }
    this.cambiarEstadoPedido(pedidoEncontrado, estado);
  }

  async finalizarPedido(nroPedido: number, estado: EstadosPedido) {
    const aprobado = await getRepository(EstadoPedido).findOne({ where: { nombre: EstadosPedido.APROBADO } });
    const pedidoEncontrado = await getRepository(Pedido).findOne(nroPedido, { where: { estado: aprobado } });
    if (!pedidoEncontrado) {
      return { mensaje: 'El pedido no se ha encontrado en nuestro sistema', status: 400 };
    }
    const detallesPedido = await getRepository(DetallePedido).find({ where: { pedido: pedidoEncontrado } });
    if (detallesPedido.length <= 0) {
      return { mensaje: 'El pedido no contiene articulos', status: 400 };
    }
    this.cambiarEstadoPedido(pedidoEncontrado, estado);
  }

  async enviarDelivery(nroPedido: number, estado: EstadosPedido) {
    const terminado = await getRepository(EstadoPedido).findOne({ where: { nombre: EstadosPedido.TERMINADO } });
    const pedidoEncontrado = await getRepository(Pedido).findOne(nroPedido, {
      where: { estado: terminado, tipoEnvio: TiposEnvios.DELIVERY },
    });
    if (!pedidoEncontrado) {
      return { mensaje: 'El pedido no se ha encontrado en nuestro sistema', status: 400 };
    }
    const detallesPedido = await getRepository(DetallePedido).find({ where: { pedido: pedidoEncontrado } });
    if (detallesPedido.length <= 0) {
      return { mensaje: 'El pedido no contiene articulos', status: 400 };
    }
    this.cambiarEstadoPedido(pedidoEncontrado, estado);
  }

  async facturarPedido(nroPedido: number, estado: EstadosPedido) {
    const terminado = await getRepository(EstadoPedido).findOne({ where: { nombre: EstadosPedido.TERMINADO } });
    const delivery = await getRepository(EstadoPedido).findOne({ where: { nombre: EstadosPedido.EN_DELIVERY } });
    const pedidoEncontrado = await getRepository(Pedido).findOne(nroPedido, {
      where: { estado: terminado || delivery },
    });
    if (!pedidoEncontrado) {
      return { mensaje: 'El pedido no se ha encontrado en nuestro sistema', status: 400 };
    }
    const detallesPedido = await getRepository(DetallePedido).find({ where: { pedido: pedidoEncontrado } });
    if (detallesPedido.length <= 0) {
      return { mensaje: 'El pedido no contiene articulos', status: 400 };
    }
    //Procedemos a facturas las compras
    const factura = new Factura();
    factura.fechaFacturacion = new Date();
    await getRepository(Factura).save(factura); //Instanciamos la factura en la base de datos.
    factura.formaPago = pedidoEncontrado.tipoEnvio == TiposEnvios.DELIVERY ? FormaPago.MERCADOPAGO : FormaPago.EFECTIVO;
    factura.pedido = pedidoEncontrado;
    factura.nroTarjeta = await this.obtenerNroTarjeta(pedidoEncontrado);
    factura.totalVenta = await this.calcularTotalVentas(pedidoEncontrado, factura);
    factura.totalCosto = await this.calcularTotalCostos(pedidoEncontrado);
    factura.montoDescuento = pedidoEncontrado.tipoEnvio == TiposEnvios.RETIRO_LOCAL ? factura.totalVenta * 0.1 : 0; //Calculamos el 10% en caso de que sea retirar por local, sino es simplemente 0.
    this.cambiarEstadoPedido(pedidoEncontrado, estado);
    await getRepository(Factura).save(factura); //Y Guardamos el resto de los atributos de la misma factura.
  }

  async cambiarEstadoPedido(pedido: Pedido, estado: EstadosPedido) {
    switch (estado) {
      case EstadosPedido.APROBADO:
        pedido.estado = await getRepository(EstadoPedido).findOne({
          where: { nombre: EstadosPedido.APROBADO },
        });
        break;
      case EstadosPedido.TERMINADO:
        pedido.estado = await getRepository(EstadoPedido).findOne({
          where: { nombre: EstadosPedido.TERMINADO },
        });
        break;
      case EstadosPedido.EN_DELIVERY:
        pedido.estado = await getRepository(EstadoPedido).findOne({
          where: { nombre: EstadosPedido.EN_DELIVERY },
        });
        break;
      case EstadosPedido.FACTURADO:
        pedido.estado = await getRepository(EstadoPedido).findOne({
          where: { nombre: EstadosPedido.FACTURADO },
        });
        break;
      case EstadosPedido.RECHAZADO:
        pedido.estado = await getRepository(EstadoPedido).findOne({
          where: { nombre: EstadosPedido.RECHAZADO },
        });
        break;
      default:
    }
    await getRepository(Pedido).save(pedido);
  }

  async obtenerPedidos(estado: EstadosPedido) {
    const pedidos = await getRepository(Pedido)
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.estado', 'estado')
      .where('estado.nombre = :nombre', { nombre: estado })
      .getMany();
    return pedidos;
  }

  async obtenerNroTarjeta(pedido: Pedido) {
    const datosMercadoPago = await getRepository(MercadoPagoDatos).findOne({ where: { pedido } });
    if (!datosMercadoPago) {
      return '';
    }
    return datosMercadoPago?.nroTarjeta;
  }

  async calcularTotalVentas(pedido: Pedido, factura: Factura) {
    const pedidosDetalle = await getRepository(DetallePedido).find({ where: { pedido } });
    if (pedidosDetalle.length <= 0) {
      return 0;
    }
    let total = 0;
    await Promise.all(
      pedidosDetalle.map(async (detalle) => {
        //Por cada detallePedido, se crea un detalleFactura
        const detalleFactura = new DetalleFactura();
        detalleFactura.cantidad = detalle.cantidad;
        detalleFactura.subtotal = detalle.subtotal;
        if (detalle.articulo) {
          detalleFactura.articulo = detalle.articulo;
        }
        if (detalle.articuloManufacturado) {
          detalleFactura.articuloManufacturado = detalle.articuloManufacturado;
        }
        detalleFactura.factura = factura;
        await getRepository(DetalleFactura).save(detalleFactura);
        total = total + detalle.subtotal; // Vamos sumando los subtotales al total para devolver el total completo.
      })
    );
    return total;
  }

  async calcularTotalCostos(pedido: Pedido) {
    const pedidosDetalle = await getRepository(DetallePedido).find({ where: { pedido } });
    if (pedidosDetalle.length <= 0) {
      return 0;
    }
    let total = 0;
    await Promise.all(
      pedidosDetalle.map(async (detalle) => {
        if (detalle.articulo) {
          const costo = detalle.articulo?.precioCompra || 0;
          total = total + costo;
        }
        if (detalle.articuloManufacturado) {
          const articuloManufacturadoDetalles = await getRepository(ArticuloManufacturadoDetalle).find({
            where: { articuloManufacturado: detalle.articuloManufacturado },
          });
          articuloManufacturadoDetalles.forEach((detalle: any) => {
            const costo = detalle.articuloInsumo?.precioCompra || 0;
            total = total + costo;
          });
        }
      })
    );
    return total;
  }
}

export default new PedidoService();
