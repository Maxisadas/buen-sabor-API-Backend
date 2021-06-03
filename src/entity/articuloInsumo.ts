import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { ArticuloManufacturadoDetalle } from './articuloManufacturadoDetalle';
import { DetallePedido } from './detalle-pedido';
import { RubroArticulo } from './rubroArticulo';
import { Stock } from './stock';
@Entity()
export class ArticuloInsumo {
  @PrimaryGeneratedColumn()
  id?: number;
  @Column({ nullable: true, default: null })
  denominacion?: string;
  @Column({ nullable: true, default: null })
  esInsumo?: boolean;
  @Column({ nullable: true, default: null })
  precioCompra?: number;
  @Column({ nullable: true, default: null })
  precioVenta?: number;
  @Column({ nullable: true, default: null })
  fechaCreacion?: Date;
  @Column({ nullable: true, default: null })
  fechaBaja?: Date;
  @ManyToOne(() => Stock, (stock) => stock.articulos, { cascade: true })
  stock?: Stock;
  @ManyToOne(() => RubroArticulo, (rubro) => rubro.articulos)
  rubro?: RubroArticulo;
  @OneToMany(() => DetallePedido, (detallePedido) => detallePedido.articulo)
  detallePedidos?: DetallePedido[];
  @OneToMany(() => ArticuloManufacturadoDetalle, (articuloManufacturadoDetalle) => articuloManufacturadoDetalle.articuloInsumo)
  articulosManufacturadoDetalle?: ArticuloManufacturadoDetalle[];
}
