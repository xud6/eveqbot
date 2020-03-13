import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584081623591 implements MigrationInterface {
    name = 'dbupdate1584081623591'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `eve_esi_universe_groups` (`id` bigint NOT NULL, `category_id` bigint NOT NULL, `group_id` bigint NOT NULL, `en_name` varchar(200) NOT NULL, `cn_name` varchar(200) NOT NULL, `published` tinyint NOT NULL, `en_raw` text NOT NULL, `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` ADD CONSTRAINT `FK_49a280a8cdb89913033a29a1d05` FOREIGN KEY (`group_id`) REFERENCES `eve_esi_universe_groups`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_groups` ADD CONSTRAINT `FK_10b1dfb818b1cca2e266562b161` FOREIGN KEY (`category_id`) REFERENCES `eve_esi_universe_categories`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `eve_esi_universe_groups` DROP FOREIGN KEY `FK_10b1dfb818b1cca2e266562b161`", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` DROP FOREIGN KEY `FK_49a280a8cdb89913033a29a1d05`", undefined);
        await queryRunner.query("DROP TABLE `eve_esi_universe_groups`", undefined);
    }

}
