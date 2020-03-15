import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584261690453 implements MigrationInterface {
    name = 'dbupdate1584261690453'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `eve_esi_universe_regions` (`id` bigint NOT NULL, `name_en` varchar(200) NOT NULL, `name_cn` varchar(200) NOT NULL, `description_en` text NULL DEFAULT NULL, `description_cn` text NULL DEFAULT NULL, `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `eve_esi_universe_regions`", undefined);
    }

}
