import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1583996896193 implements MigrationInterface {
    name = 'dbupdate1583996896193'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `qq_bot_message_log` (`id` int NOT NULL AUTO_INCREMENT, `message` text NOT NULL, `message_id` int NOT NULL, `message_type` varchar(200) NOT NULL, `group_id` int NULL, `atMe` tinyint NOT NULL DEFAULT 0, `sender_user_id` int NOT NULL, `sender_nickname` varchar(200) NOT NULL, `self_id` int NOT NULL, `raw_event` text NOT NULL, `raw_context` text NOT NULL, `raw_tags` text NOT NULL, `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `qq_bot_message_log`", undefined);
    }

}
