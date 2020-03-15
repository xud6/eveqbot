import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584266779155 implements MigrationInterface {
    name = 'dbupdate1584266779155'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `eve_esi_universe_constellations` (`id` bigint NOT NULL, `name_en` varchar(200) NOT NULL, `name_cn` varchar(200) NOT NULL, `position` text NOT NULL, `region_id` bigint NOT NULL, `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX `IDX_b85c33f166d3ade35e7b2200a6` (`region_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_constellations` ADD CONSTRAINT `FK_b85c33f166d3ade35e7b2200a6b` FOREIGN KEY (`region_id`) REFERENCES `eve_esi_universe_regions`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `eve_esi_universe_constellations` DROP FOREIGN KEY `FK_b85c33f166d3ade35e7b2200a6b`", undefined);
        await queryRunner.query("DROP INDEX `IDX_b85c33f166d3ade35e7b2200a6` ON `eve_esi_universe_constellations`", undefined);
        await queryRunner.query("DROP TABLE `eve_esi_universe_constellations`", undefined);
    }

}
