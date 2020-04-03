import {MigrationInterface, QueryRunner} from "typeorm";

export class dbupdate1585919850351 implements MigrationInterface {
    name = 'dbupdate1585919850351'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `eve_esi_universe_systems_near_distance` (`id` bigint NOT NULL AUTO_INCREMENT, `from_system_id` bigint NOT NULL, `target_system_id` bigint NOT NULL, `distance` float NOT NULL, INDEX `IDX_ba6c1e0df77f0133e0f894be5d` (`from_system_id`), INDEX `IDX_5be57022beca131c06de48b557` (`target_system_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_systems_near_distance` ADD CONSTRAINT `FK_ba6c1e0df77f0133e0f894be5dc` FOREIGN KEY (`from_system_id`) REFERENCES `eve_esi_universe_systems`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_systems_near_distance` ADD CONSTRAINT `FK_5be57022beca131c06de48b5578` FOREIGN KEY (`target_system_id`) REFERENCES `eve_esi_universe_systems`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `eve_esi_universe_systems_near_distance` DROP FOREIGN KEY `FK_5be57022beca131c06de48b5578`", undefined);
        await queryRunner.query("ALTER TABLE `eve_esi_universe_systems_near_distance` DROP FOREIGN KEY `FK_ba6c1e0df77f0133e0f894be5dc`", undefined);
        await queryRunner.query("DROP INDEX `IDX_5be57022beca131c06de48b557` ON `eve_esi_universe_systems_near_distance`", undefined);
        await queryRunner.query("DROP INDEX `IDX_ba6c1e0df77f0133e0f894be5d` ON `eve_esi_universe_systems_near_distance`", undefined);
        await queryRunner.query("DROP TABLE `eve_esi_universe_systems_near_distance`", undefined);
    }

}
