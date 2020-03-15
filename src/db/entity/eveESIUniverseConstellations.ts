import { Entity, PrimaryColumn, Column, UpdateDateColumn, OneToMany, ManyToOne, Index, JoinColumn } from "typeorm";
import { eveESIUniverseRegions } from "./eveESIUniverseRegions";
import { tConstellationPosition } from "../../api/eveESI/universe/constellations";

@Entity()
export class eveESIUniverseConstellations {
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
        type: "simple-json"
    })
    position: tConstellationPosition

    @Index()
    @Column({
        type: "bigint"
    })
    region_id: number

    @ManyToOne(
        type => eveESIUniverseRegions,
        region => region.constellations,
        {
            onDelete: "CASCADE",
            nullable: false
        }
    )
    @JoinColumn({ name: "region_id" })
    region: eveESIUniverseRegions;

    @UpdateDateColumn()
    updateDate: Date;
}
