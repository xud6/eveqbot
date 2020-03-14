import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584187266623 implements MigrationInterface {
    name = 'dbupdate1584187266623'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_source` ADD `production` tinyint NOT NULL DEFAULT 1", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_source` DROP COLUMN `production`", undefined);
    }

}
