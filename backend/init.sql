-- This script creates the table for storing URL analysis results.

CREATE TABLE IF NOT EXISTS `analysis_results` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `url` VARCHAR(2048) NOT NULL,
    `status` ENUM('queued', 'running', 'done', 'error') NOT NULL DEFAULT 'queued',
    
    -- Collected data fields (can be NULL until analysis is done)
    `html_version` VARCHAR(50),
    `page_title` TEXT,
    `headings_count_json` JSON, -- Storing heading counts as a JSON object e.g., {"h1": 1, "h2": 5}
    `internal_links_count` INT,
    `external_links_count` INT,
    `inaccessible_links_count` INT,
    `has_login_form` BOOLEAN,
    
    -- Timestamps for tracking
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Index on the URL for faster lookups
    INDEX `idx_url` (`url`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

