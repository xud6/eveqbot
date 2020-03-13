import { Entity, Column, PrimaryColumn, UpdateDateColumn, JoinColumn, ManyToOne } from "typeorm";
import { tTypesGetByIdResult } from "../../eveESI/universe/types";
import { eveESIUniverseGroups } from "./eveESIUniverseGroups";

@Entity()
export class eveESIUniverseTypes {
    @PrimaryColumn({
        type: "bigint"
    })
    id: number;

    @Column({
        type: "bigint"
    })
    group_id: number

    @ManyToOne(
        type => eveESIUniverseGroups,
        group => group.types,
        {
            onDelete: "CASCADE",
            nullable: false
        }
    )
    @JoinColumn()
    group: eveESIUniverseGroups;

    @Column({
        type: "bigint",
        nullable: true,
        default: null
    })
    market_group_id: number | null

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
    en_raw: tTypesGetByIdResult

    @Column("simple-json")
    cn_raw: tTypesGetByIdResult

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

    @UpdateDateColumn()
    updateDate: Date;
}
