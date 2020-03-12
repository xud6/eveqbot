import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { CQTag, CQEvent } from "@xud6/cq-websocket";

@Entity()
export class QQBotMessageLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("simple-json")
    raw_event: CQEvent

    @Column("simple-json")
    raw_context: Record<string, any>

    @Column("simple-json")
    raw_tags: CQTag[]
}
