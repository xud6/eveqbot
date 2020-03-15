import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1584276343724 implements MigrationInterface {
    name = 'dbupdate1584276343724'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE INDEX `IDX_0316b783f2a60f6533ff93cf5a` ON `eve_esi_universe_types` (`published`, `market_group_id`, `group_id`)", undefined);
        await queryRunner.query("CREATE INDEX `IDX_9b9cd2741f6718997b7ea6ae7e` ON `eve_esi_universe_types` (`published`, `group_id`)", undefined);
        await queryRunner.query("CREATE INDEX `IDX_8612149875815e4ba3b1b3d147` ON `eve_esi_universe_types` (`published`, `market_group_id`)", undefined);
        await queryRunner.query("CREATE INDEX `IDX_aea2dab21bb2774c432b2f6c67` ON `eve_esi_universe_types` (`published`, `name_cn`)", undefined);
        await queryRunner.query("CREATE INDEX `IDX_3e2cdcab79ffbe489155d5c848` ON `eve_esi_universe_types` (`published`, `name_en`)", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_3e2cdcab79ffbe489155d5c848` ON `eve_esi_universe_types`", undefined);
        await queryRunner.query("DROP INDEX `IDX_aea2dab21bb2774c432b2f6c67` ON `eve_esi_universe_types`", undefined);
        await queryRunner.query("DROP INDEX `IDX_8612149875815e4ba3b1b3d147` ON `eve_esi_universe_types`", undefined);
        await queryRunner.query("DROP INDEX `IDX_9b9cd2741f6718997b7ea6ae7e` ON `eve_esi_universe_types`", undefined);
        await queryRunner.query("DROP INDEX `IDX_0316b783f2a60f6533ff93cf5a` ON `eve_esi_universe_types`", undefined);
    }

}
