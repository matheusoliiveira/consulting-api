import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Tree,
  TreeParent,
  TreeChildren
} from "typeorm";
import { Area } from "./Area";

@Entity('processos')
@Tree("materialized-path")
export class Processo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  nome!: string;

  @Column({ type: 'text', nullable: true })
  descricao!: string;

  @Column({ type: 'varchar', default: 'manual' })
  tipo!: string;

  @Column({ type: 'simple-array', nullable: true })
  ferramentas!: string[];

  @Column({ type: 'simple-array', nullable: true })
  responsaveis!: string[];

  @Column({ type: 'text', nullable: true })
  documentacao!: string;

  @ManyToOne(() => Area, (area) => area.processos, { onDelete: 'SET NULL', nullable: true })
  area!: Area;

  @TreeParent({ onDelete: 'CASCADE' })
  pai!: Processo | null;

  @TreeChildren()
  sub_processos!: Processo[];
}