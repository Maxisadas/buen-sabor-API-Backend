import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany } from 'typeorm';
import { ArticuloInsumo } from './articuloInsumo';
@Entity()
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: true, default: null })
  cantidad: number;
  @Column({ nullable: true, default: null })
  stockMinimo: number;
  @OneToMany(() => ArticuloInsumo, (articulo) => articulo.stock)
  articulos: ArticuloInsumo[];
}
