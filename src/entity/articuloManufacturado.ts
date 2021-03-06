import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { ArticuloInsumo } from './articuloInsumo';
import { ArticuloManufacturadoDetalle } from './articuloManufacturadoDetalle';
import { DetallePedido } from './detalle-pedido';

@Entity()
export class ArticuloManufacturado {
  @PrimaryGeneratedColumn()
  id?: number;
  @Column({ nullable: true, default: null })
  denominacion?: string;
  @Column({ nullable: true, default: null })
  tiempoEstimadoCocina?: number;
  @Column({ nullable: true, default: null })
  precioVenta?: number;
  @Column({ nullable: true, default: null })
  imagen?: string;
  @Column({ nullable: true, default: null })
  fechaCreacion?: Date;
  @Column({ nullable: true, default: null })
  fechaBaja?: Date;
  @OneToMany(() => DetallePedido, (detallePedido) => detallePedido.articuloManufacturado)
  detallePedidos?: DetallePedido[] | undefined ;
  @OneToMany(() => ArticuloManufacturadoDetalle, (articuloManufacturadoDetalle) => articuloManufacturadoDetalle.articuloManufacturado, {cascade: true})
  articulosManufacturadoDetalle?: ArticuloManufacturadoDetalle[] | undefined;
}
