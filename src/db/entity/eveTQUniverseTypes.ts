import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class eveTQUniverseTypes {
    @PrimaryColumn({
        type: "bigint"
    })
    id: number;

    @Column({
        type: "varchar",
        length: 200
    })
    en_name: string

    @Column({
        type: "text"
    })
    en_description: string

    @Column("simple-json")
    en_raw: any

    @Column({
        type: "varchar",
        length: 200
    })
    cn_name: string

    @Column({
        type: "text"
    })
    cn_description: string

    @Column("simple-json")
    cn_raw: any
}
