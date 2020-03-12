import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584002384904 implements MigrationInterface {
    name = 'dbupdate1584002384904'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `kvs` (`id` int NOT NULL AUTO_INCREMENT, `key` varchar(200) NOT NULL, `value` text NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` CHANGE `group_id` `group_id` int NULL", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` CHANGE `group_id` `group_id` int NULL DEFAULT 'NULL'", undefined);
        await queryRunner.query("DROP TABLE `kvs`", undefined);
    }

}
