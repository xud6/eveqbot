import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584070350987 implements MigrationInterface {
    name = 'dbupdate1584070350987'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `eve_esi_universe_types` (`id` bigint NOT NULL, `group_id` bigint NOT NULL, `market_group_id` bigint NULL DEFAULT NULL, `published` tinyint NOT NULL, `en_name` varchar(200) NOT NULL, `cn_name` varchar(200) NOT NULL, `en_description` text NOT NULL, `cn_description` text NOT NULL, `en_raw` text NOT NULL, `cn_raw` text NOT NULL, `graphic_id` bigint NULL DEFAULT NULL, `icon_id` bigint NULL DEFAULT NULL, `type_id` bigint NOT NULL, `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `eve_esi_universe_types`", undefined);
    }

}
