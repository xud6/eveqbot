import { Entity, PrimaryColumn, Column, UpdateDateColumn, OneToMany } from "typeorm";
import { eveESIUniverseConstellations } from "./eveESIUniverseConstellations";

@Entity()
export class eveESIUniverseRegions {
    @PrimaryColumn({
        type: "bigint"
    })
    id: number

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
        type: "text",
        nullable: true,
        default: null
    })
    description_en: string | null

    @Column({
        type: "text",
        nullable: true,
        default: null
    })
    description_cn: string | null

    @UpdateDateColumn()
    updateDate: Date;

    @OneToMany(type => eveESIUniverseConstellations, constellations => constellations.region)
    constellations: eveESIUniverseConstellations[];
}
