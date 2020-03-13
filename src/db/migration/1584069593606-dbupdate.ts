import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584069593606 implements MigrationInterface {
    name = 'dbupdate1584069593606'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `eve_tq_universe_types` ADD `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `eve_tq_universe_types` DROP COLUMN `updateDate`", undefined);
    }

}
