/*
  Warnings:

  - Added the required column `full_name` to the `certificate_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `certificate_requests` ADD COLUMN `end_date` DATE NULL,
    ADD COLUMN `full_name` VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN `start_date` DATE NULL;

-- Backfill existing rows (if any) then keep it required
UPDATE `certificate_requests` SET `full_name` = 'UNKNOWN' WHERE `full_name` = '';

ALTER TABLE `certificate_requests` ALTER COLUMN `full_name` DROP DEFAULT;
