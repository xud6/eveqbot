import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584262923205 implements MigrationInterface {
    name = 'dbupdate1584262923205'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` CHANGE `en_name` `name_en` varchar(200) NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_groups` CHANGE `en_name` `name_en` varchar(200) NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_categories` CHANGE `en_name` `name_en` varchar(200) NOT NULL", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `eve_esi_universe_categories` CHANGE `name_en` `en_name` varchar(200) NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_groups` CHANGE `name_en` `en_name` varchar(200) NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_types` CHANGE `name_en` `en_name` varchar(200) NOT NULL", undefined);
    }

}
