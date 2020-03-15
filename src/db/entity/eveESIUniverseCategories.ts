import { Entity, PrimaryColumn, Column, UpdateDateColumn, OneToMany } from "typeorm";
import { eveESIUniverseGroups } from "./eveESIUniverseGroups";

@Entity()
export class eveESIUniverseCategories {
    @PrimaryColumn({
        type: "bigint"
    })
    id: number;

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

    @UpdateDateColumn()
    updateDate: Date;

    @OneToMany(type => eveESIUniverseGroups, groups => groups.category)
    groups: eveESIUniverseGroups[];
}
