import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584023766512 implements MigrationInterface {
    name = 'dbupdate1584023766512'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `eve_tq_universe_types` (`id` bigint NOT NULL, `en_name` varchar(200) NOT NULL, `cn_name` varchar(200) NOT NULL, `en_description` text NOT NULL, `cn_description` text NOT NULL, `en_raw` text NOT NULL, `cn_raw` text NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `eve_tq_universe_types`", undefined);
    }

}
