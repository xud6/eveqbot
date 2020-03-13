import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm";
import { CQTag, CQEvent } from "@xud6/cq-websocket";
import { QQBotMessageSource } from "./QQBotMessageSource";

@Entity()
export class QQBotMessageLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "text"
    })
    message: string

    @Column({
        type: "bigint"
    })
    message_id: number

    @Column({
        type: "varchar",
        length: 200
    })
    message_type: string

    @Column({
        type: "bigint",
        nullable: true,
        default: null
    })
    group_id: number | null

    @Column({
        type: "boolean",
        default: false
    })
    atMe: boolean

    @Column({
        type: "bigint"
    })
    sender_user_id: number

    @Column({
        type: "varchar",
        length: 200
    })
    sender_nickname: string

    @Column({
        type: "bigint"
    })
    self_id: number

    @Index()
    @Column({
        type: "int",
        nullable: true,
        default: null
    })
    sourceId: number;

    @ManyToOne(
        type => QQBotMessageSource,
        source => source.messageLog,
        {
            onDelete: "CASCADE"
        }
    )
    @JoinColumn()
    source: QQBotMessageSource;

    @Column("simple-json")
    raw_event: CQEvent

    @Column("simple-json")
    raw_context: Record<string, any>

    @Column("simple-json")
    raw_tags: CQTag[]

    @UpdateDateColumn()
    updateDate: Date;
}
