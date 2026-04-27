-- Allow coupons to be restricted to a specific course (nullable)
ALTER TABLE `coupons` ADD COLUMN `course_id` VARCHAR(191) NULL;
ALTER TABLE `coupons`
  ADD CONSTRAINT `coupons_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

