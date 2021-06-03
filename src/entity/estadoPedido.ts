import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Pedido } from './pedido';

@Entity()
export class EstadoPedido {
  @PrimaryGeneratedColumn()
  id?: number;
  @Column({ nullable: true, default: null })
  nombre?: string;
  @OneToMany(() => Pedido, (pedido) => pedido.estado)
  pedidos?: Pedido[];
}
