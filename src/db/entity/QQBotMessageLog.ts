import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm";
import { CQTag, CQEvent } from "@xud6/cq-websocket";
import { QQBotMessageSource } from "./QQBotMessageSource";

@Entity()
export class QQBotMessageLog {
    @PrimaryGeneratedColumn({
        type: "bigint"
    })
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
        type: "bigint",
        nullable: true,
        default: null
    })
    discuss_id: number | null

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
        type: "varchar",
        length: 200,
        nullable: true,
        default: null
    })
    sender_card: string | null

    @Column({
        type: "varchar",
        length: 200,
        nullable: true,
        default: null
    })
    sender_area: string | null

    @Column({
        type: "varchar",
        length: 200,
        nullable: true,
        default: null
    })
    sender_level: string | null

    @Column({
        type: "varchar",
        length: 200,
        nullable: true,
        default: null
    })
    sender_role: string | null

    @Column({
        type: "varchar",
        length: 200,
        nullable: true,
        default: null
    })
    sender_title: string | null

    @Column({
        type: "bigint"
    })
    self_id: number

    @Column({
        type: "bigint"
    })
    time: number

    @Column({
        type: "varchar",
        length: 200,
        nullable: true,
        default: null
    })
    sub_type: string | null

    @Column({
        type: "simple-json",
        nullable: true,
        default: null
    })
    anonymous: any

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

    raw_tags: CQTag[]

    @UpdateDateColumn()
    updateDate: Date;
}
