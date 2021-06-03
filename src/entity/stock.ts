import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany } from 'typeorm';
import { ArticuloInsumo } from './articuloInsumo';
@Entity()
export class Stock {
  @PrimaryGeneratedColumn()
  id?: number;
  @Column({ nullable: true, default: null })
  cantidad?: number;
  @Column({ nullable: true, default: null })
  stockMinimo?: number;
  @Column({ nullable: true, default: null })
  unidadMedida?: string;
  @OneToMany(() => ArticuloInsumo, (articulo) => articulo.stock)
  articulos?: ArticuloInsumo[];
}
