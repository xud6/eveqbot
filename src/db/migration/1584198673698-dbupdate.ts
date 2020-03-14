import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584198673698 implements MigrationInterface {
    name = 'dbupdate1584198673698'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_source` ADD `admins` text NOT NULL", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_source` DROP COLUMN `admins`", undefined);
    }

}
