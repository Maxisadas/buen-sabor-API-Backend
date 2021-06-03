import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Domicilio {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: true, default: null })
  calle: string;
  @Column({ nullable: true, default: null })
  numero: number;
  @Column({ nullable: true, default: null })
  localidad: string;
}
