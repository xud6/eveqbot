import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584183938834 implements MigrationInterface {
    name = 'dbupdate1584183938834'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_source` ADD `eve_server` int NOT NULL DEFAULT 1", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_source` DROP COLUMN `eve_server`", undefined);
    }

}
