import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584076029907 implements MigrationInterface {
    name = 'dbupdate1584076029907'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `eve_esi_universe_categories` (`id` bigint NOT NULL, `category_id` bigint NOT NULL, `published` tinyint NOT NULL, `en_name` varchar(200) NOT NULL, `cn_name` varchar(200) NOT NULL, `en_raw` text NOT NULL, `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `eve_esi_universe_categories`", undefined);
    }

}
