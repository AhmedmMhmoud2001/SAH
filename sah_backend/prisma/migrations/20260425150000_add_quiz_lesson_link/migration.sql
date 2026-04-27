-- Add lesson_id to quizzes to support per-lesson quizzes
ALTER TABLE `quizzes`
  ADD COLUMN `lesson_id` VARCHAR(191) NULL,
  ADD UNIQUE INDEX `quizzes_lesson_id_key` (`lesson_id`),
  ADD CONSTRAINT `quizzes_lesson_id_fkey` FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

