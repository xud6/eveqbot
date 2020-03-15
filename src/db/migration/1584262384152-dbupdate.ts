import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584262384152 implements MigrationInterface {
    name = 'dbupdate1584262384152'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` DROP COLUMN `type_id`", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_groups` DROP COLUMN `group_id`", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_categories` DROP COLUMN `category_id`", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `eve_esi_universe_categories` ADD `category_id` bigint NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_groups` ADD `group_id` bigint NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` ADD `type_id` bigint NOT NULL", undefined);
    }

}
