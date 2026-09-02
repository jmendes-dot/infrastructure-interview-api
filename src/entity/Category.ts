import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "categories" })
export class Category {
  @PrimaryGeneratedColumn({ type: "int" })
  id!: number;

  @Column({ length: 120, unique: true })
  name!: string;
}
