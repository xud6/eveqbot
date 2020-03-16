import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584328962890 implements MigrationInterface {
    name = 'dbupdate1584328962890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `eve_esi_universe_systems` CHANGE `stations` `stations_raw` text NULL DEFAULT NULL", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `eve_esi_universe_systems` CHANGE `stations_raw` `stations` text NULL DEFAULT NULL", undefined);
    }

}
