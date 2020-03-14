import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584186639678 implements MigrationInterface {
    name = 'dbupdate1584186639678'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_source` ADD `eve_marketApi` int NOT NULL DEFAULT 0", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_source` DROP COLUMN `eve_marketApi`", undefined);
    }

}
