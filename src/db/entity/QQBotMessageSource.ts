import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { QQBotMessageLog } from "./QQBotMessageLog";
import { eveServer, eveMarketApi } from "../../types";

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

    @Column({
        type: "int",
        default: eveServer.serenity
    })
    eve_server: eveServer

    @Column({
        type: "int",
        default: eveMarketApi.ceveMarket
    })
    eve_marketApi: eveMarketApi

    @Column({
        type: "varchar",
        length: 200,
        default: ""
    })
    comment: string

    @OneToMany(type => QQBotMessageLog, messageLog => messageLog.source)
    messageLog: QQBotMessageLog[];
}
