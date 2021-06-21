import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { Pedido } from './pedido';

@Entity()
export class MercadoPagoDatos {
  @PrimaryGeneratedColumn()
  idPago: number;
  @Column({ nullable: true, default: null })
  fechaCreacion: Date;
  @Column({ nullable: true, default: null })
  fechaAprobacion: Date;
  @Column({ nullable: true, default: null })
  formaPago: string;
  @Column({ nullable: true, default: null })
  nroTarjeta: string;
  @Column({ nullable: true, default: null })
  estado: string;
  @ManyToOne(() => Pedido, (pedido) => pedido.mercadoPagoDatos)
  pedido?: Pedido | undefined;
}
