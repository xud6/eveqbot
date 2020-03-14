import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584184111292 implements MigrationInterface {
    name = 'dbupdate1584184111292'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_source` ADD `comment` varchar(200) NOT NULL DEFAULT ''", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_source` DROP COLUMN `comment`", undefined);
    }

}
