import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class qqbot_message_log {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("simple-json")
    raw_event: any

    @Column("simple-json")
    raw_context: any

    @Column("simple-json")
    raw_tags: any
}
