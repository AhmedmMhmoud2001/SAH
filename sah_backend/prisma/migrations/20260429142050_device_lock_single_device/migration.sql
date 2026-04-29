-- AlterTable
ALTER TABLE `users` ADD COLUMN `device_bound_at` DATETIME(3) NULL,
    ADD COLUMN `device_id` VARCHAR(191) NULL,
    ADD COLUMN `device_info` LONGTEXT NULL;

-- CreateTable
CREATE TABLE `device_change_requests` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `new_device_id` VARCHAR(191) NOT NULL,
    `new_device_info` LONGTEXT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewed_at` DATETIME(3) NULL,
    `reviewed_by_admin_id` VARCHAR(191) NULL,

    INDEX `device_change_requests_user_id_status_idx`(`user_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `device_change_requests` ADD CONSTRAINT `device_change_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device_change_requests` ADD CONSTRAINT `device_change_requests_reviewed_by_admin_id_fkey` FOREIGN KEY (`reviewed_by_admin_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
