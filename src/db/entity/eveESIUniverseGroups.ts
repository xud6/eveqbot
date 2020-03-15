import { Entity, PrimaryColumn, Column, UpdateDateColumn, JoinColumn, ManyToOne, OneToMany, Index } from "typeorm";
import { eveESIUniverseCategories } from "./eveESIUniverseCategories";
import { eveESIUniverseTypes } from "./eveESIUniverseTypes";

@Entity()
export class eveESIUniverseGroups {
    @PrimaryColumn({
        type: "bigint"
    })
    id: number;

    @Index()
    @Column({
        type: "bigint"
    })
    category_id: number

    @ManyToOne(
        type => eveESIUniverseCategories,
        category => category.groups,
        {
            onDelete: "CASCADE",
            nullable: false
        }
    )
    @JoinColumn({ name: "category_id" })
    category: eveESIUniverseCategories;

    @Column({
        type: "varchar",
        length: 200
    })
    name_en: string

    @Column({
        type: "varchar",
        length: 200
    })
    name_cn: string

    @Column({
        type: "boolean",
    })
    published: boolean

    @UpdateDateColumn()
    updateDate: Date;

    @OneToMany(type => eveESIUniverseTypes, types => types.group)
    types: eveESIUniverseTypes[];
}
