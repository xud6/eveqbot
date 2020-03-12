import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584028194400 implements MigrationInterface {
    name = 'dbupdate1584028194400'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `eve_tq_universe_types` (`id` bigint NOT NULL, `group_id` bigint NOT NULL, `market_group_id` bigint NULL DEFAULT NULL, `published` tinyint NOT NULL, `en_name` varchar(200) NOT NULL, `cn_name` varchar(200) NOT NULL, `en_description` text NOT NULL, `cn_description` text NOT NULL, `en_raw` text NOT NULL, `cn_raw` text NOT NULL, `graphic_id` bigint NULL DEFAULT NULL, `icon_id` bigint NULL DEFAULT NULL, `type_id` bigint NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `eve_tq_universe_types`", undefined);
    }

}
