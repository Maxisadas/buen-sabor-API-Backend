import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany, ManyToOne } from 'typeorm';
import { ArticuloInsumo } from './articuloInsumo';
import { ArticuloManufacturado } from './articuloManufacturado';
import { Factura } from './factura';
@Entity()
export class DetalleFactura {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: true, default: null })
  cantidad: number;
  @Column({ nullable: true, default: null })
  subtotal: number;
  @ManyToOne(() => ArticuloInsumo, (articulo) => articulo.detallePedidos, { eager: true })
  articulo: ArticuloInsumo;
  @ManyToOne(() => ArticuloManufacturado, (articuloManufacturado) => articuloManufacturado.detallePedidos, {
    eager: true,
  })
  articuloManufacturado: ArticuloManufacturado;
  @ManyToOne(() => Factura, (factura) => factura.detalleFacturas, { eager: true })
  factura: Factura;
}
