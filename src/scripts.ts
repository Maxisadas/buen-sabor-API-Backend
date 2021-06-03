import { getRepository } from 'typeorm';
import { ArticuloInsumo } from './entity/articuloInsumo';
import { ArticuloManufacturado } from './entity/articuloManufacturado';
import { ArticuloManufacturadoDetalle } from './entity/articuloManufacturadoDetalle';
import { EstadoPedido } from './entity/estadoPedido';

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
        articulosManufacturadoDetalle: [{
          cantidad: 200,
          unidadMedida: 'Gramos',
          articuloInsumo: await getRepository(ArticuloInsumo).findOne({where:{denominacion:'Harina'}})
        },
        {
          cantidad: 1,
          unidadMedida: 'Unidades',
          articuloInsumo: await getRepository(ArticuloInsumo).findOne({where:{denominacion:'Salsa'}})
        },
        {
          cantidad: 30,
          unidadMedida: 'Gramos',
          articuloInsumo: await getRepository(ArticuloInsumo).findOne({where:{denominacion:'Rucula'}})
        },
        {
          cantidad: 200,
          unidadMedida: 'Gramos',
          articuloInsumo: await getRepository(ArticuloInsumo).findOne({where:{denominacion:'Jamon Crudo'}})
        }]
      },
    ];
    await getRepository(ArticuloManufacturado).save(articulos);
  }
};

export default carga_inicial_datos;
