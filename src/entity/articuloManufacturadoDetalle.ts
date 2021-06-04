import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { ArticuloInsumo } from './articuloInsumo';
import { ArticuloManufacturado } from './articuloManufacturado';
import { DetallePedido } from './detalle-pedido';

@Entity()
export class ArticuloManufacturadoDetalle {
  @PrimaryGeneratedColumn()
  id?: number;
  @Column({ nullable: true, default: null })
  cantidad?: number;
  @Column({ nullable: true, default: null })
  unidadMedida?: string;
  @ManyToOne(() => ArticuloManufacturado, (articuloManufacturado) => articuloManufacturado.articulosManufacturadoDetalle,{eager:true})
  articuloManufacturado?: ArticuloManufacturado | undefined;
  @ManyToOne(() => ArticuloInsumo, (articuloInsumo) => articuloInsumo.articulosManufacturadoDetalle,{eager:true})
  articuloInsumo?: ArticuloInsumo | undefined;
}