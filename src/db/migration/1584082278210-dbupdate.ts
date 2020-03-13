import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584082278210 implements MigrationInterface {
    name = 'dbupdate1584082278210'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` ADD `sourceId` int NULL DEFAULT NULL", undefined);
        await queryRunner.query("CREATE INDEX `IDX_51eba8a5498a88dc5584b90f3d` ON `qq_bot_message_log` (`sourceId`)", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` ADD CONSTRAINT `FK_51eba8a5498a88dc5584b90f3d7` FOREIGN KEY (`sourceId`) REFERENCES `qq_bot_message_source`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` DROP FOREIGN KEY `FK_51eba8a5498a88dc5584b90f3d7`", undefined);
        await queryRunner.query("DROP INDEX `IDX_51eba8a5498a88dc5584b90f3d` ON `qq_bot_message_log`", undefined);
        await queryRunner.query("ALTER TABLE `qq_bot_message_log` DROP COLUMN `sourceId`", undefined);
    }

}
