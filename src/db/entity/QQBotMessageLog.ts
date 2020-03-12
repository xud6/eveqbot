import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from "typeorm";
import { CQTag, CQEvent } from "@xud6/cq-websocket";

@Entity()
export class QQBotMessageLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "text"
    })
    message: string

    @Column({
        type: "int"
    })
    message_id: number

    @Column({
        type: "varchar",
        length: 200
    })
    message_type: string

    @Column({
        type: "int",
        nullable: true
    })
    group_id: number

    @Column({
        type: "boolean",
        default: false
    })
    atMe: boolean

    @Column({
        type: "int"
    })
    sender_user_id: number

    @Column({
        type: "varchar",
        length: 200
    })
    sender_nickname: string

    @Column({
        type: "int"
    })
    self_id: number

    @Column("simple-json")
    raw_event: CQEvent

    @Column("simple-json")
    raw_context: Record<string, any>

    @Column("simple-json")
    raw_tags: CQTag[]

    @UpdateDateColumn()
    updateDate: Date;
}
