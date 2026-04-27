-- AlterTable
ALTER TABLE `certificate_requests` ADD COLUMN `certificate_image_ar_url` LONGTEXT NULL,
    ADD COLUMN `certificate_image_en_url` LONGTEXT NULL,
    ADD COLUMN `completion_at` DATETIME(3) NULL,
    ADD COLUMN `full_name_en` VARCHAR(255) NULL;
