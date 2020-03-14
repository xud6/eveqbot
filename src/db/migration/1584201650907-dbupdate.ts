import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584201650907 implements MigrationInterface {
    name = 'dbupdate1584201650907'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_source` CHANGE `links` `info` text NOT NULL", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_source` CHANGE `info` `links` text NOT NULL", undefined);
    }

}
