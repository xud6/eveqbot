import { Entity, PrimaryColumn, Column, UpdateDateColumn, OneToMany } from "typeorm";
import { tTypesGetByIdResult } from "../../eveESI/universe/types";
import { tCategoriesGetByIdResult } from "../../eveESI/universe/categories";
import { eveESIUniverseGroups } from "./eveESIUniverseGroups";

@Entity()
export class eveESIUniverseCategories {
    @PrimaryColumn({
        type: "bigint"
    })
    id: number;

    @Column({
        type: "bigint"
    })
    category_id: number

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

    @Column("simple-json")
    en_raw: tCategoriesGetByIdResult

    @UpdateDateColumn()
    updateDate: Date;

    @OneToMany(type => eveESIUniverseGroups, groups => groups.category)
    groups: eveESIUniverseGroups[];
}
