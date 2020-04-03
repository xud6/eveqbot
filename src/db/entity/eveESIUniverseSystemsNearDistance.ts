import {Entity, PrimaryGeneratedColumn, Index, Column, JoinColumn, ManyToOne} from "typeorm";
import { eveESIUniverseSystems } from "./eveESIUniverseSystems";

@Entity()
export class eveESIUniverseSystemsNearDistance {
    @PrimaryGeneratedColumn({
        type: "bigint"
    })
    id: number

    @Index()
    @Column({
        type: "bigint"
    })
    from_system_id: number

    @ManyToOne(
        type => eveESIUniverseSystems,
        system => system.nearDistances,
        {
            onDelete: "CASCADE",
            nullable: false
        }
    )
    @JoinColumn({ name: "from_system_id" })
    from_system: eveESIUniverseSystems;


    @Index()
    @Column({
        type: "bigint"
    })
    target_system_id: number

    @ManyToOne(
        type => eveESIUniverseSystems,
        {
            onDelete: "CASCADE",
            nullable: false
        }
    )
    @JoinColumn({ name: "target_system_id" })
    target_system: eveESIUniverseSystems;

    @Column({
        type: "float"
    })
    distance: number
}
