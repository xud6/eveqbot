import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584197304543 implements MigrationInterface {
    name = 'dbupdate1584197304543'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_source` ADD `links` text NOT NULL", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_source` DROP COLUMN `links`", undefined);
    }

}
