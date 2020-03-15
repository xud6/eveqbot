import { Entity, Column, PrimaryColumn, UpdateDateColumn, JoinColumn, ManyToOne, Index } from "typeorm";
import { eveESIUniverseGroups } from "./eveESIUniverseGroups";

@Entity()
@Index(["published", "name_en"])
@Index(["published", "name_cn"])
@Index(["published", "market_group_id"])
@Index(["published", "group_id"])
@Index(["published", "market_group_id", "group_id"])
export class eveESIUniverseTypes {
    @PrimaryColumn({
        type: "bigint"
    })
    id: number;

    @Index()
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
    @JoinColumn({ name: "group_id" })
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
    name_en: string

    @Column({
        type: "varchar",
        length: 200
    })
    name_cn: string

    @Column({
        type: "text"
    })
    description_en: string

    @Column({
        type: "text"
    })
    description_cn: string

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
        type: "float",
        nullable: true,
        default: null,
        precision: 12
    })
    capacity: number | null

    @Column({
        type: "float",
        nullable: true,
        default: null,
        precision: 12
    })
    mass: number | null

    @Column({
        type: "float",
        nullable: true,
        default: null,
        precision: 12
    })
    packaged_volume: number | null

    @Column({
        type: "bigint",
        nullable: true,
        default: null
    })
    portion_size: number | null

    @Column({
        type: "float",
        nullable: true,
        default: null,
        precision: 12
    })
    radius: number | null

    @Column({
        type: "float",
        nullable: true,
        default: null,
        precision: 12
    })
    volume: number | null

    @Column({
        type: "simple-json",
        nullable: true,
        default: null
    })
    dogma_attributes: any

    @Column({
        type: "simple-json",
        nullable: true,
        default: null
    })
    dogma_effects: any

    @UpdateDateColumn()
    updateDate: Date;
}
