import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

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
}
