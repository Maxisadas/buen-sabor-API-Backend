import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Domicilio } from './domicilio';
import { Pedido } from './pedido';
import { User } from './user';

@Entity()
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: true, default: null })
  apellido: string;
  @Column({ nullable: true, default: null })
  email: string;
  @Column({ nullable: true, default: null })
  nombre: string;
  @Column({ nullable: true, default: null })
  telefono: number;
  @Column({ nullable: true, default: null })
  fechaCreacion: Date;
  @Column({ nullable: true, default: null })
  fechaBaja: Date;
  @OneToOne(() => User, { nullable: true })
  @JoinColumn()
  usuario: User;
  @OneToOne(() => Domicilio, { nullable: true, eager: true })
  @JoinColumn()
  domicilio: Domicilio;
  @OneToMany(() => Pedido, (pedido) => pedido.cliente)
  pedidos: Pedido[];
}
