import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1583992770776 implements MigrationInterface {
    name = 'dbupdate1583992770776'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `qqbot_message_log` (`id` int NOT NULL AUTO_INCREMENT, `raw_event` text NOT NULL, `raw_context` text NOT NULL, `raw_tags` text NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `qqbot_message_log`", undefined);
    }

}
