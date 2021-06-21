import { getRepository } from 'typeorm';
import { ArticuloInsumo } from './entity/articuloInsumo';
import { ArticuloManufacturado } from './entity/articuloManufacturado';
import { ArticuloManufacturadoDetalle } from './entity/articuloManufacturadoDetalle';
import { Configuracion } from './entity/configuracion';
import { EstadoPedido } from './entity/estadoPedido';
import { HorarioAtencion } from './entity/horarioAtencion';

const carga_inicial_datos = async () => {
  const estado = await getRepository(EstadoPedido).findOne();
  if (!estado) {
    const estados: EstadoPedido[] = [
      {
        nombre: 'CREADO',
      },
      {
        nombre: 'PENDIENTE',
      },
      {
        nombre: 'APROBADO',
      },
      {
        nombre: 'TERMINADO',
      },
      {
        nombre: 'EN DELIVERY',
      },
      {
        nombre: 'FACTURADO',
      },
      {
        nombre: 'RECHAZADO',
      },
    ];
    await getRepository(EstadoPedido).save(estados);
  }
  const articuloInsumo = await getRepository(ArticuloInsumo).findOne();
  if (!articuloInsumo) {
    const articulos: ArticuloInsumo[] = [
      {
        denominacion: 'Coca cola por 1,5L',
        esInsumo: false,
        precioCompra: 80,
        precioVenta: 120,
        fechaCreacion: new Date(),
        stock: {
          stockMinimo: 5,
          cantidad: 50,
          unidadMedida: 'Unidades',
        },
      },
      {
        denominacion: 'Jamon Crudo',
        esInsumo: true,
        precioCompra: 30,
        precioVenta: 50,
        fechaCreacion: new Date(),
        stock: {
          stockMinimo: 1000,
          cantidad: 5000,
          unidadMedida: 'Gramos',
        },
      },
      {
        denominacion: 'Rucula',
        esInsumo: true,
        precioCompra: 15,
        precioVenta: 30,
        fechaCreacion: new Date(),
        stock: {
          stockMinimo: 500,
          cantidad: 4500,
          unidadMedida: 'Gramos',
        },
      },
      {
        denominacion: 'Harina',
        esInsumo: true,
        precioCompra: 60,
        precioVenta: 90,
        fechaCreacion: new Date(),
        stock: {
          stockMinimo: 1000,
          cantidad: 8000,
          unidadMedida: 'Gramos',
        },
      },
      {
        denominacion: 'Salsa',
        esInsumo: true,
        precioCompra: 80,
        precioVenta: 100,
        fechaCreacion: new Date(),
        stock: {
          stockMinimo: 50,
          cantidad: 1500,
          unidadMedida: 'Unidades',
        },
      },
    ];
    await getRepository(ArticuloInsumo).save(articulos);
  }
  const articuloManufacturado = await getRepository(ArticuloManufacturado).findOne();
  if (!articuloManufacturado) {
    const articulos: ArticuloManufacturado[] = [
      {
        denominacion: 'Pizza de jamon con rucula',
        tiempoEstimadoCocina: 1,
        precioVenta: 420,
        imagen: 'https://t2.rg.ltmcdn.com/es/images/5/6/1/img_pizza_con_rucula_y_tomates_cherry_65165_orig.jpg',
        fechaCreacion: new Date(),
        articulosManufacturadoDetalle: [
          {
            cantidad: 200,
            unidadMedida: 'Gramos',
            articuloInsumo: await getRepository(ArticuloInsumo).findOne({ where: { denominacion: 'Harina' } }),
          },
          {
            cantidad: 1,
            unidadMedida: 'Unidades',
            articuloInsumo: await getRepository(ArticuloInsumo).findOne({ where: { denominacion: 'Salsa' } }),
          },
          {
            cantidad: 30,
            unidadMedida: 'Gramos',
            articuloInsumo: await getRepository(ArticuloInsumo).findOne({ where: { denominacion: 'Rucula' } }),
          },
          {
            cantidad: 200,
            unidadMedida: 'Gramos',
            articuloInsumo: await getRepository(ArticuloInsumo).findOne({ where: { denominacion: 'Jamon Crudo' } }),
          },
        ],
      },
    ];
    await getRepository(ArticuloManufacturado).save(articulos);
  }
  const configuracionEncontrado = await getRepository(Configuracion).findOne();
  if (!configuracionEncontrado) {
    const configuracion = new Configuracion();
    configuracion.cantidadCocinero = 10;
    configuracion.emailEmpresa = 'buenSabor@gmail.com';
    configuracion.tokenMercadoPago = 'TEST-192086747159117-062100-de8890cd8cfc2f72abea4df7e09e7ae1-778764730'; // AGREGAR TOKEN DE VENDEDOR AQUI!!!
    const horarios: HorarioAtencion[] = [
      {
        dias: 'ENTRE_SEMANA',
        horaApertura: 20,
        horaCierre: 12,
      },
      {
        dias: 'FINES_SEMANA',
        horaApertura: 11,
        horaCierre: 15,
      },
    ];
    configuracion.horarios = horarios;
    await getRepository(Configuracion).save(configuracion);
  }
};

export default carga_inicial_datos;
