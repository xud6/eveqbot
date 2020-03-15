import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584263109095 implements MigrationInterface {
    name = 'dbupdate1584263109095'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` CHANGE `cn_description` `description_cn` text NOT NULL", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` CHANGE `description_cn` `cn_description` text NOT NULL", undefined);
    }

}
