import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany, ManyToOne } from 'typeorm';
import { ArticuloInsumo } from './articuloInsumo';
import { ArticuloManufacturado } from './articuloManufacturado';
import { Pedido } from './pedido';
@Entity()
export class DetallePedido {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: true, default: null })
  cantidad: number;
  @Column({ nullable: true, default: null })
  subtotal: number;
  @ManyToOne(() => ArticuloInsumo, (articulo) => articulo.detallePedidos)
  articulo: ArticuloInsumo;
  @ManyToOne(() => ArticuloManufacturado, (articuloManufacturado) => articuloManufacturado.detallePedidos)
  articuloManufacturado: ArticuloManufacturado;
  @ManyToOne(() => Pedido, (pedido) => pedido.detallePedidos,{eager:true})
  pedido: Pedido;
}
