import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584006157099 implements MigrationInterface {
    name = 'dbupdate1584006157099'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `kvs` (`id` int NOT NULL AUTO_INCREMENT, `key` varchar(200) NOT NULL, `value` text NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("CREATE TABLE `qq_bot_message_log` (`id` int NOT NULL AUTO_INCREMENT, `message` text NOT NULL, `message_id` bigint NOT NULL, `message_type` varchar(200) NOT NULL, `group_id` bigint NULL, `atMe` tinyint NOT NULL DEFAULT 0, `sender_user_id` bigint NOT NULL, `sender_nickname` varchar(200) NOT NULL, `self_id` bigint NOT NULL, `raw_event` text NOT NULL, `raw_context` text NOT NULL, `raw_tags` text NOT NULL, `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("CREATE TABLE `qq_bot_message_source` (`id` int NOT NULL AUTO_INCREMENT, `source_type` varchar(200) NOT NULL, `source_id` bigint NOT NULL, `enable` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `qq_bot_message_source`", undefined);
        await queryRunner.query("DROP TABLE `qq_bot_message_log`", undefined);
        await queryRunner.query("DROP TABLE `kvs`", undefined);
    }

}
