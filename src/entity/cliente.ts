import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
}
