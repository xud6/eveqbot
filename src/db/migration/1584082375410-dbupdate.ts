import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584082375410 implements MigrationInterface {
    name = 'dbupdate1584082375410'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE INDEX `IDX_49a280a8cdb89913033a29a1d0` ON `eve_esi_universe_types` (`group_id`)", undefined);
        await queryRunner.query("CREATE INDEX `IDX_10b1dfb818b1cca2e266562b16` ON `eve_esi_universe_groups` (`category_id`)", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_10b1dfb818b1cca2e266562b16` ON `eve_esi_universe_groups`", undefined);
        await queryRunner.query("DROP INDEX `IDX_49a280a8cdb89913033a29a1d0` ON `eve_esi_universe_types`", undefined);
    }

}
