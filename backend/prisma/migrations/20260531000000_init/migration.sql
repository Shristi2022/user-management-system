-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phoneNumber` VARCHAR(20) NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `gender` VARCHAR(30) NULL,
    `address` VARCHAR(500) NULL,
    `occupation` VARCHAR(100) NULL,
    `skills` JSON NOT NULL,
    `profileImage` VARCHAR(2083) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE KEY `users_email_key` (`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
