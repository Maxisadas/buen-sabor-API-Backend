import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Cliente } from './cliente';
import { DetallePedido } from './detalle-pedido';
import { EstadoPedido } from './estadoPedido';
import { MercadoPagoDatos } from './mercadoPagoDatos';
@Entity()
export class Pedido {
  @PrimaryGeneratedColumn()
  numeroPedido: number;
  @Column({ nullable: true, default: null })
  fechaPedido: Date;
  @Column({ nullable: true, default: null })
  horaEstimadaFin: number;
  @Column({ nullable: true, default: null })
  tipoEnvio: string;
  @Column({ nullable: true, default: null })
  total: number;
  @OneToMany(() => DetallePedido, (detallePedido) => detallePedido.pedido)
  detallePedidos: DetallePedido[];
  @ManyToOne(() => Cliente, (cliente) => cliente.pedidos)
  cliente?: Cliente | undefined;
  @ManyToOne(() => EstadoPedido, (estadoPedido) => estadoPedido.pedidos, { eager: true, cascade: true })
  estado?: EstadoPedido | undefined;
  @OneToMany(() => MercadoPagoDatos, (mercadoPagoDatos) => mercadoPagoDatos.pedido)
  mercadoPagoDatos: MercadoPagoDatos[];
}
