import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { QQBotMessageLog } from "./QQBotMessageLog";

@Entity()
export class QQBotMessageSource {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "varchar",
        length: 200
    })
    source_type: string

    @Column({
        type: "bigint"
    })
    source_id: number

    @Column({
        type: "boolean",
        default: false
    })
    enable: boolean

    @OneToMany(type => QQBotMessageLog, messageLog => messageLog.source)
    messageLog: QQBotMessageLog[];
}
