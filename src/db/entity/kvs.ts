import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class kvs {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "varchar",
        length: 200
    })
    key: string

    @Column({
        type: "text"
    })
    value: string
}
