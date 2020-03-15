import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584262976117 implements MigrationInterface {
    name = 'dbupdate1584262976117'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` CHANGE `en_description` `description_en` text NOT NULL", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` CHANGE `description_en` `en_description` text NOT NULL", undefined);
    }

}
