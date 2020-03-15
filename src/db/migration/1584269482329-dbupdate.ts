import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584269482329 implements MigrationInterface {
    name = 'dbupdate1584269482329'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `eve_esi_universe_systems` (`id` bigint NOT NULL, `constellation_id` bigint NOT NULL, `name_en` varchar(200) NOT NULL, `name_cn` varchar(200) NOT NULL, `planets_raw` text NULL DEFAULT NULL, `position` text NOT NULL, `security_class` varchar(200) NULL DEFAULT NULL, `security_status` float(12) NOT NULL, `star_id` bigint NULL DEFAULT NULL, `stargates` text NULL DEFAULT NULL, `stations` text NULL DEFAULT NULL, `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX `IDX_5c95bb93144fe6a33ce287bb25` (`constellation_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_systems` ADD CONSTRAINT `FK_5c95bb93144fe6a33ce287bb25a` FOREIGN KEY (`constellation_id`) REFERENCES `eve_esi_universe_constellations`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `eve_esi_universe_systems` DROP FOREIGN KEY `FK_5c95bb93144fe6a33ce287bb25a`", undefined);
        await queryRunner.query("DROP INDEX `IDX_5c95bb93144fe6a33ce287bb25` ON `eve_esi_universe_systems`", undefined);
        await queryRunner.query("DROP TABLE `eve_esi_universe_systems`", undefined);
    }

}
