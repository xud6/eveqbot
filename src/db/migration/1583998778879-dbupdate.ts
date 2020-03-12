import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1583998778879 implements MigrationInterface {
    name = 'dbupdate1583998778879'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `qq_bot_message_source` (`id` int NOT NULL AUTO_INCREMENT, `source_type` varchar(200) NOT NULL, `source_id` int NOT NULL, `enable` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` CHANGE `group_id` `group_id` int NULL", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` CHANGE `group_id` `group_id` int NULL DEFAULT 'NULL'", undefined);
        await queryRunner.query("DROP TABLE `qq_bot_message_source`", undefined);
    }

}
