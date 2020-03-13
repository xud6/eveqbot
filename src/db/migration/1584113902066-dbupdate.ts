import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584113902066 implements MigrationInterface {
    name = 'dbupdate1584113902066'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` DROP COLUMN `raw_event`", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` ADD `raw_event` text NOT NULL", undefined);
    }

}
