import { Entity, PrimaryColumn, Column, UpdateDateColumn, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { eveESIUniverseCategories } from "./eveESIUniverseCategories";
import { tGroupsGetByIdResult } from "../../eveESI/universe/groups";
import { eveESIUniverseTypes } from "./eveESIUniverseTypes";

@Entity()
export class eveESIUniverseGroups {
    @PrimaryColumn({
        type: "bigint"
    })
    id: number;

    @Column({
        type: "bigint"
    })
    category_id: number

    @ManyToOne(
        type => eveESIUniverseCategories,
        category => category.groups,
        {
            onDelete: "CASCADE"
        }
    )
    @JoinColumn()
    category: eveESIUniverseCategories;

    @Column({
        type: "bigint"
    })
    group_id: number

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
        type: "boolean",
    })
    published: boolean

    @Column("simple-json")
    en_raw: tGroupsGetByIdResult

    @UpdateDateColumn()
    updateDate: Date;
    
    @OneToMany(type => eveESIUniverseTypes, types => types.group)
    types: eveESIUniverseTypes[];
}
