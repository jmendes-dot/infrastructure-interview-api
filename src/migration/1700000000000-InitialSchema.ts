import type { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1700000000000 implements MigrationInterface {
  name = "InitialSchema1700000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TABLE `categories` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(120) NOT NULL, UNIQUE INDEX `UQ_categories_name` (`name`), PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
    await queryRunner.query(
      "CREATE TABLE `posts` (`id` int NOT NULL AUTO_INCREMENT, `title` varchar(200) NOT NULL, `text` text NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
    await queryRunner.query(
      "CREATE TABLE `post_categories` (`post_id` int NOT NULL, `category_id` int NOT NULL, INDEX `IDX_post_categories_post` (`post_id`), INDEX `IDX_post_categories_category` (`category_id`), PRIMARY KEY (`post_id`, `category_id`)) ENGINE=InnoDB",
    );
    await queryRunner.query(
      "ALTER TABLE `post_categories` ADD CONSTRAINT `FK_post_categories_post` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION",
    );
    await queryRunner.query(
      "ALTER TABLE `post_categories` ADD CONSTRAINT `FK_post_categories_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `post_categories` DROP FOREIGN KEY `FK_post_categories_category`");
    await queryRunner.query("ALTER TABLE `post_categories` DROP FOREIGN KEY `FK_post_categories_post`");
    await queryRunner.query("DROP TABLE `post_categories`");
    await queryRunner.query("DROP TABLE `posts`");
    await queryRunner.query("DROP TABLE `categories`");
  }
}
