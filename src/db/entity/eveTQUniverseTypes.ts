import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class eveTQUniverseTypes {
    @PrimaryColumn({
        type: "bigint"
    })
    id: number;

    @Column({
        type: "bigint"
    })
    group_id: number

    @Column({
        type: "bigint",
        nullable: true,
        default: null
    })
    market_group_id: number

    @Column({
        type: "boolean",
    })
    published: boolean

    @Column({
        type: "varchar",
        length: 200
    })
    en_name: string

    @Column({
        type: "varchar",
        length: 200
    })
    cn_name: string

    @Column({
        type: "text"
    })
    en_description: string

    @Column({
        type: "text"
    })
    cn_description: string

    @Column("simple-json")
    en_raw: any

    @Column("simple-json")
    cn_raw: any

    @Column({
        type: "bigint",
        nullable: true,
        default: null
    })
    graphic_id: number | null

    @Column({
        type: "bigint",
        nullable: true,
        default: null
    })
    icon_id: number | null

    @Column({
        type: "bigint",
    })
    type_id: number
}
