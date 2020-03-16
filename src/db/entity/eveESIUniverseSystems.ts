import { Entity, PrimaryColumn, Column, UpdateDateColumn, OneToMany, ManyToOne, Index, JoinColumn } from "typeorm";
import { eveESIUniverseConstellations } from "./eveESIUniverseConstellations";
import { tSystemPosition, tSystemPlanet } from "../../api/eveESI/universe/systems";

@Entity()
export class eveESIUniverseSystems {
    @PrimaryColumn({
        type: "bigint"
    })
    id: number

    @Index()
    @Column({
        type: "bigint"
    })
    constellation_id: number

    @ManyToOne(
        type => eveESIUniverseConstellations,
        constellation => constellation.systems,
        {
            onDelete: "CASCADE",
            nullable: false
        }
    )
    @JoinColumn({ name: "constellation_id" })
    constellation: eveESIUniverseConstellations;

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
        type: "simple-json",
        nullable: true,
        default: null
    })
    planets_raw: tSystemPlanet[] | null

    @Column({
        type: "simple-json"
    })
    position: tSystemPosition

    @Column({
        type: "varchar",
        length: 200,
        nullable: true,
        default: null
    })
    security_class: string | null

    @Column({
        type: "float",
        precision: 12
    })
    security_status: number

    @Column({
        type: "bigint",
        nullable: true,
        default: null
    })
    star_id: number | null

    @Column({
        type: "simple-array",
        nullable: true,
        default: null
    })
    stargates_raw: number[] | null

    @Column({
        type: "simple-array",
        nullable: true,
        default: null
    })
    stations: number[] | null

    @UpdateDateColumn()
    updateDate: Date;
}
