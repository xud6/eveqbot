import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584082809640 implements MigrationInterface {
    name = 'dbupdate1584082809640'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` CHANGE `id` `id` int NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` DROP PRIMARY KEY", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` DROP COLUMN `id`", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` ADD `id` bigint NOT NULL PRIMARY KEY AUTO_INCREMENT", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` DROP COLUMN `id`", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` ADD `id` int NOT NULL AUTO_INCREMENT", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` ADD PRIMARY KEY (`id`)", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` CHANGE `id` `id` int NOT NULL AUTO_INCREMENT", undefined);
    }

}
