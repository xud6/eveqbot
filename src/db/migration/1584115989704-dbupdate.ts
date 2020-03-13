import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584115989704 implements MigrationInterface {
    name = 'dbupdate1584115989704'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` DROP COLUMN `raw_context`", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` DROP COLUMN `raw_tags`", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` ADD `discuss_id` bigint NULL DEFAULT NULL", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` ADD `sender_card` varchar(200) NULL DEFAULT NULL", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` ADD `sender_area` varchar(200) NULL DEFAULT NULL", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` ADD `sender_level` varchar(200) NULL DEFAULT NULL", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` ADD `sender_role` varchar(200) NULL DEFAULT NULL", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` ADD `sender_title` varchar(200) NULL DEFAULT NULL", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` ADD `time` bigint NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` ADD `sub_type` varchar(200) NULL DEFAULT NULL", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` ADD `anonymous` text NULL DEFAULT NULL", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` DROP COLUMN `anonymous`", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` DROP COLUMN `sub_type`", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` DROP COLUMN `time`", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` DROP COLUMN `sender_title`", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` DROP COLUMN `sender_role`", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` DROP COLUMN `sender_level`", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` DROP COLUMN `sender_area`", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` DROP COLUMN `sender_card`", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` DROP COLUMN `discuss_id`", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` ADD `raw_tags` text NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` ADD `raw_context` text NOT NULL", undefined);
    }

}
