import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584263034027 implements MigrationInterface {
    name = 'dbupdate1584263034027'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` CHANGE `cn_name` `name_cn` varchar(200) NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_groups` CHANGE `cn_name` `name_cn` varchar(200) NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_categories` CHANGE `cn_name` `name_cn` varchar(200) NOT NULL", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `eve_esi_universe_categories` CHANGE `name_cn` `cn_name` varchar(200) NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_groups` CHANGE `name_cn` `cn_name` varchar(200) NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` CHANGE `name_cn` `cn_name` varchar(200) NOT NULL", undefined);
    }

}
