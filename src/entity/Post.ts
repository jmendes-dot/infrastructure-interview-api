import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./Category.js";

@Entity({ name: "posts" })
export class Post {
  @PrimaryGeneratedColumn({ type: "int" })
  id!: number;

  @Column({ length: 200 })
  title!: string;

  @Column({ type: "text" })
  text!: string;

  @ManyToMany(() => Category, { cascade: ["insert"] })
  @JoinTable({
    name: "post_categories",
    joinColumn: { name: "post_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "category_id", referencedColumnName: "id" },
  })
  categories!: Category[];
}
