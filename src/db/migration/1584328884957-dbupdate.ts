import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584328884957 implements MigrationInterface {
    name = 'dbupdate1584328884957'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `eve_esi_universe_systems` CHANGE `stargates` `stargates_raw` text NULL DEFAULT 'NULL'", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `eve_esi_universe_systems` CHANGE `stargates_raw` `stargates` text NULL DEFAULT 'NULL'", undefined);
    }

}
