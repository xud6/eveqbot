import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1586491445737 implements MigrationInterface {
    name = 'dbupdate1586491445737'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` ADD `replyMessage` text NULL", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` DROP COLUMN `replyMessage`", undefined);
    }

}
