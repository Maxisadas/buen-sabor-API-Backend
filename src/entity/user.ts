import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  nombreUsuario: string;
  @Column()
  constrasena: string;
  @Column()
  rolUsuario: string;
  @Column()
  fechaCreacion: Date;
  @Column({ nullable: true, default: null })
  fechaBaja: Date;
}
