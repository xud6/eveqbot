import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584098189578 implements MigrationInterface {
    name = 'dbupdate1584098189578'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` DROP COLUMN `en_raw`", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` DROP COLUMN `cn_raw`", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_groups` DROP COLUMN `en_raw`", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_categories` DROP COLUMN `en_raw`", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` ADD `capacity` float(12) NULL DEFAULT NULL", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` ADD `mass` float(12) NULL DEFAULT NULL", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` ADD `packaged_volume` float(12) NULL DEFAULT NULL", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` ADD `portion_size` bigint NULL DEFAULT NULL", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` ADD `radius` float(12) NULL DEFAULT NULL", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` ADD `volume` float(12) NULL DEFAULT NULL", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` ADD `dogma_attributes` text NULL DEFAULT NULL", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` ADD `dogma_effects` text NULL DEFAULT NULL", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` DROP COLUMN `dogma_effects`", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` DROP COLUMN `dogma_attributes`", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` DROP COLUMN `volume`", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` DROP COLUMN `radius`", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` DROP COLUMN `portion_size`", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` DROP COLUMN `packaged_volume`", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` DROP COLUMN `mass`", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` DROP COLUMN `capacity`", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_categories` ADD `en_raw` text NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_groups` ADD `en_raw` text NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` ADD `cn_raw` text NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` ADD `en_raw` text NOT NULL", undefined);
    }

}
