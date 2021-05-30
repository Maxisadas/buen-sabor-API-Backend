import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user';

@Entity()
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  apellido: string;
  @Column()
  email: string;
  @Column()
  nombre: string;
  @Column()
  telefono: number;
  @Column()
  fechaCreacion: Date;
  @Column({ nullable: true, default: null })
  fechaBaja: Date;
  @OneToOne(() => User)
  @JoinColumn()
  usuario: User;
}
