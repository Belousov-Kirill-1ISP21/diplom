-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: ins_system
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accidents`
--

DROP TABLE IF EXISTS `accidents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accidents` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `client_id` bigint unsigned NOT NULL,
  `policy_id` bigint unsigned NOT NULL,
  `accident_date` date NOT NULL,
  `damage_amount` decimal(10,2) DEFAULT NULL,
  `is_client_fault` tinyint(1) DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','approved','rejected','paid') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `accidents_client_id_index` (`client_id`),
  KEY `accidents_policy_id_index` (`policy_id`),
  CONSTRAINT `accidents_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `client_profiles` (`id`),
  CONSTRAINT `accidents_policy_id_foreign` FOREIGN KEY (`policy_id`) REFERENCES `policies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accidents`
--

LOCK TABLES `accidents` WRITE;
/*!40000 ALTER TABLE `accidents` DISABLE KEYS */;
INSERT INTO `accidents` VALUES (1,2,2,'2026-03-15',25000.00,0,'ДТП на перекрестке, поврежден бампер и фара','paid','2026-05-23 20:58:50','2026-05-23 20:58:50'),(2,2,2,'2026-03-20',50000.00,1,'Наезд на бордюр, повреждена подвеска','approved','2026-05-23 20:58:50','2026-05-23 20:58:50');
/*!40000 ALTER TABLE `accidents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `client_driver_categories`
--

DROP TABLE IF EXISTS `client_driver_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client_driver_categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `client_profile_id` bigint unsigned NOT NULL,
  `category_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `client_driver_categories_client_profile_id_category_code_unique` (`client_profile_id`,`category_code`),
  KEY `client_driver_categories_category_code_foreign` (`category_code`),
  CONSTRAINT `client_driver_categories_category_code_foreign` FOREIGN KEY (`category_code`) REFERENCES `vehicle_categories` (`code`),
  CONSTRAINT `client_driver_categories_client_profile_id_foreign` FOREIGN KEY (`client_profile_id`) REFERENCES `client_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_driver_categories`
--

LOCK TABLES `client_driver_categories` WRITE;
/*!40000 ALTER TABLE `client_driver_categories` DISABLE KEYS */;
INSERT INTO `client_driver_categories` VALUES (1,1,'B','2026-05-23 20:58:50','2026-05-23 20:58:50'),(2,2,'B','2026-05-23 20:58:50','2026-05-23 20:58:50');
/*!40000 ALTER TABLE `client_driver_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `client_profiles`
--

DROP TABLE IF EXISTS `client_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client_profiles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `last_name` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `first_name` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `middle_name` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `passport_series` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `passport_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `passport_issued_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `passport_issue_date` date DEFAULT NULL,
  `passport_expiry_date` date DEFAULT NULL,
  `driver_license_series` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `driver_license_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `driver_license_issued_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `driver_license_issue_date` date DEFAULT NULL,
  `driver_license_expiry_date` date DEFAULT NULL,
  `driver_experience_years` int NOT NULL DEFAULT '0',
  `bonus_malus_class` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'M',
  `has_accidents_last_year` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `client_profiles_user_id_unique` (`user_id`),
  CONSTRAINT `client_profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_profiles`
--

LOCK TABLES `client_profiles` WRITE;
/*!40000 ALTER TABLE `client_profiles` DISABLE KEYS */;
INSERT INTO `client_profiles` VALUES (1,3,'Иванов','Иван','Иванович','1985-05-15','4501','123456','ОВД г. Москвы','2010-06-20',NULL,'99','1234567890','ГИБДД г. Москвы','2015-03-10','2025-03-10',0,'M',0,'2026-05-23 20:58:49','2026-05-23 20:58:49'),(2,4,'Петров','Петр','Петрович','1992-11-23','4502','654321','ОВД г. Москвы','2012-08-15',NULL,'77','0987654321','ГИБДД г. Москвы','2018-01-20','2028-01-20',0,'M',0,'2026-05-23 20:58:50','2026-05-23 20:58:50');
/*!40000 ALTER TABLE `client_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'2026_04_02_000000_create_all_tables',1),(2,'2026_04_02_101158_create_personal_access_tokens_table',1),(3,'2026_04_04_014244_create_sessions_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `message` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `data` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_is_read_index` (`user_id`,`is_read`),
  CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,3,'Добро пожаловать в систему страхования! Оформите свой первый полис прямо сейчас.',0,'\"{\\\"priority\\\":\\\"high\\\"}\"','2026-05-23 20:58:50','2026-05-23 20:58:50'),(2,3,'Срок действия вашего полиса ОСАГО под номером 6954 истекает через 30 дней. Продлите полис вовремя!',0,'\"{\\\"days_left\\\":30,\\\"policy_type\\\":\\\"osago\\\"}\"','2026-05-23 20:58:50','2026-05-23 20:58:50'),(3,3,'Специальное предложение! Скидка 15% на КАСКО при оформлении онлайн до конца месяца.',1,'\"{\\\"discount\\\":15,\\\"expires_at\\\":\\\"2026-06-07T23:58:50.492224Z\\\"}\"','2026-05-23 20:58:50','2026-05-23 20:58:50'),(4,3,'Пожалуйста, проверьте и обновите свои персональные данные в профиле для корректного расчета страховки.',0,NULL,'2026-05-23 20:58:50','2026-05-23 20:58:50'),(5,4,'Добро пожаловать в систему страхования! Оформите свой первый полис прямо сейчас.',0,'\"{\\\"priority\\\":\\\"high\\\"}\"','2026-05-23 20:58:50','2026-05-23 20:58:50'),(6,4,'Срок действия вашего полиса ОСАГО под номером 1926 истекает через 30 дней. Продлите полис вовремя!',0,'\"{\\\"days_left\\\":30,\\\"policy_type\\\":\\\"osago\\\"}\"','2026-05-23 20:58:50','2026-05-23 20:58:50'),(7,4,'Специальное предложение! Скидка 15% на КАСКО при оформлении онлайн до конца месяца.',1,'\"{\\\"discount\\\":15,\\\"expires_at\\\":\\\"2026-06-07T23:58:50.499333Z\\\"}\"','2026-05-23 20:58:50','2026-05-23 20:58:50'),(8,4,'Оплата полиса №49202 прошла успешно. Спасибо, что выбираете нас!',1,'\"{\\\"amount\\\":18084}\"','2026-05-23 20:58:50','2026-05-23 20:58:50'),(9,4,'Пожалуйста, проверьте и обновите свои персональные данные в профиле для корректного расчета страховки.',0,NULL,'2026-05-23 20:58:50','2026-05-23 20:58:50'),(10,3,'Ваш бонус-малус класс обновлен до 7. Ваша скидка на следующий полис составит 15%!',0,'\"{\\\"old_class\\\":\\\"5\\\",\\\"new_class\\\":\\\"7\\\",\\\"discount\\\":15}\"','2026-05-23 20:58:50','2026-05-23 20:58:50'),(11,4,'Зафиксирован страховой случай по полису №12345. Статус заявления: на рассмотрении.',0,'\"{\\\"policy_number\\\":\\\"12345\\\",\\\"status\\\":\\\"reviewing\\\"}\"','2026-05-23 20:58:50','2026-05-23 20:58:50');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `policies`
--

DROP TABLE IF EXISTS `policies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `policies` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `policy_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `policy_type_id` bigint unsigned NOT NULL,
  `client_id` bigint unsigned NOT NULL,
  `vehicle_id` bigint unsigned NOT NULL,
  `tariff_id` bigint unsigned NOT NULL,
  `base_price` decimal(12,2) NOT NULL,
  `final_price` decimal(12,2) NOT NULL,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('draft','active','expired','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `franchise_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `coverage_amount` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `policies_policy_number_unique` (`policy_number`),
  KEY `policies_policy_type_id_foreign` (`policy_type_id`),
  KEY `policies_vehicle_id_foreign` (`vehicle_id`),
  KEY `policies_tariff_id_foreign` (`tariff_id`),
  KEY `policies_status_index` (`status`),
  KEY `policies_client_id_index` (`client_id`),
  CONSTRAINT `policies_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `client_profiles` (`id`),
  CONSTRAINT `policies_policy_type_id_foreign` FOREIGN KEY (`policy_type_id`) REFERENCES `policy_types` (`id`),
  CONSTRAINT `policies_tariff_id_foreign` FOREIGN KEY (`tariff_id`) REFERENCES `tariffs` (`id`),
  CONSTRAINT `policies_vehicle_id_foreign` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `policies`
--

LOCK TABLES `policies` WRITE;
/*!40000 ALTER TABLE `policies` DISABLE KEYS */;
INSERT INTO `policies` VALUES (1,'202605ZZPMCK',1,1,1,2,4118.00,4118.00,0.00,'2026-05-02','2027-05-02','active',0.00,400000.00,'2026-05-23 20:58:50','2026-05-23 20:58:50'),(2,'202605XW6MAD',1,2,2,2,4118.00,4118.00,0.00,'2026-05-19','2027-05-19','active',0.00,400000.00,'2026-05-23 20:58:50','2026-05-23 20:58:50'),(3,'202605FJL4PS',2,2,2,7,50000.00,50000.00,0.00,'2026-05-23','2027-05-23','active',5000.00,1500000.00,'2026-05-23 20:58:50','2026-05-23 20:58:50');
/*!40000 ALTER TABLE `policies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `policy_types`
--

DROP TABLE IF EXISTS `policy_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `policy_types` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `policy_types`
--

LOCK TABLES `policy_types` WRITE;
/*!40000 ALTER TABLE `policy_types` DISABLE KEYS */;
INSERT INTO `policy_types` VALUES (1,'ОСАГО','2026-05-23 20:58:48','2026-05-23 20:58:48'),(2,'КАСКО','2026-05-23 20:58:48','2026-05-23 20:58:48');
/*!40000 ALTER TABLE `policy_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tariffs`
--

DROP TABLE IF EXISTS `tariffs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tariffs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `policy_type_id` bigint unsigned NOT NULL,
  `vehicle_category` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `base_rate` decimal(10,2) NOT NULL,
  `min_rate` decimal(10,2) NOT NULL,
  `max_rate` decimal(10,2) NOT NULL,
  `power_coefficient` decimal(5,4) NOT NULL DEFAULT '1.0000',
  `experience_coefficient` decimal(5,4) NOT NULL DEFAULT '1.0000',
  `age_coefficient` decimal(5,4) NOT NULL DEFAULT '1.0000',
  `bonus_malus_coefficient` decimal(5,4) NOT NULL DEFAULT '1.0000',
  `region_coefficient` decimal(5,4) NOT NULL DEFAULT '1.0000',
  `vehicle_age_coefficient` decimal(5,4) NOT NULL DEFAULT '1.0000',
  `security_coefficient` decimal(5,4) NOT NULL DEFAULT '1.0000',
  `franchise_coefficient` decimal(5,4) NOT NULL DEFAULT '1.0000',
  `calculation_method` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tariffs_policy_type_id_foreign` (`policy_type_id`),
  KEY `tariffs_vehicle_category_foreign` (`vehicle_category`),
  CONSTRAINT `tariffs_policy_type_id_foreign` FOREIGN KEY (`policy_type_id`) REFERENCES `policy_types` (`id`),
  CONSTRAINT `tariffs_vehicle_category_foreign` FOREIGN KEY (`vehicle_category`) REFERENCES `vehicle_categories` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tariffs`
--

LOCK TABLES `tariffs` WRITE;
/*!40000 ALTER TABLE `tariffs` DISABLE KEYS */;
INSERT INTO `tariffs` VALUES (1,1,'A',1500.00,1000.00,2000.00,1.0000,1.0000,1.0000,1.0000,1.0000,1.0000,1.0000,1.0000,'basic','2026-05-23 20:58:48','2026-05-23 20:58:48'),(2,1,'B',4118.00,2746.00,4942.00,1.0000,1.0000,1.0000,1.0000,1.0000,1.0000,1.0000,1.0000,'basic','2026-05-23 20:58:48','2026-05-23 20:58:48'),(3,1,'C',5500.00,4000.00,7000.00,1.2000,1.0000,1.0000,1.0000,1.0000,1.0000,1.0000,1.0000,'basic','2026-05-23 20:58:48','2026-05-23 20:58:48'),(4,1,'D',6500.00,5000.00,8500.00,1.3000,1.0000,1.0000,1.0000,1.0000,1.0000,1.0000,1.0000,'basic','2026-05-23 20:58:48','2026-05-23 20:58:48'),(5,1,'E',2000.00,1500.00,3000.00,1.0000,1.0000,1.0000,1.0000,1.0000,1.0000,1.0000,1.0000,'basic','2026-05-23 20:58:48','2026-05-23 20:58:48'),(6,2,'A',30000.00,15000.00,80000.00,1.2000,0.9000,0.8500,1.0000,1.1000,0.9500,0.8000,0.7000,'coefficient','2026-05-23 20:58:48','2026-05-23 20:58:48'),(7,2,'B',50000.00,25000.00,150000.00,1.2000,0.9000,0.8500,1.0000,1.1000,0.9500,0.8000,0.7000,'coefficient','2026-05-23 20:58:48','2026-05-23 20:58:48'),(8,2,'C',70000.00,35000.00,200000.00,1.3000,0.9000,0.8500,1.0000,1.2000,0.9500,0.8000,0.7000,'coefficient','2026-05-23 20:58:48','2026-05-23 20:58:48'),(9,2,'D',100000.00,50000.00,250000.00,1.4000,0.9000,0.8500,1.0000,1.2000,0.9500,0.8000,0.7000,'coefficient','2026-05-23 20:58:48','2026-05-23 20:58:48'),(10,2,'E',40000.00,20000.00,100000.00,1.0000,0.9000,0.8500,1.0000,1.1000,0.9500,0.8000,0.7000,'coefficient','2026-05-23 20:58:48','2026-05-23 20:58:48');
/*!40000 ALTER TABLE `tariffs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_types`
--

DROP TABLE IF EXISTS `user_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_types` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_types`
--

LOCK TABLES `user_types` WRITE;
/*!40000 ALTER TABLE `user_types` DISABLE KEYS */;
INSERT INTO `user_types` VALUES (1,'admin','2026-05-23 20:58:48','2026-05-23 20:58:48'),(2,'agent','2026-05-23 20:58:48','2026-05-23 20:58:48'),(3,'client','2026-05-23 20:58:48','2026-05-23 20:58:48');
/*!40000 ALTER TABLE `user_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_type_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_phone_unique` (`phone`),
  KEY `users_user_type_id_foreign` (`user_type_id`),
  CONSTRAINT `users_user_type_id_foreign` FOREIGN KEY (`user_type_id`) REFERENCES `user_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@insurancesystem.com','1111111111','$2y$12$vquv/vCwGOOS00xTD3f3meFPot6LkK2aB1ZNEvxia6z5gupjkh9Ee',1,'2026-05-23 20:58:49','2026-05-23 20:58:49'),(2,'agent@insurancesystem.com','2222222222','$2y$12$VzNhv9dzTcTE0nUHrgo8SueicKCaRalH6yNMf3HeyVbYMcwD/H7aC',2,'2026-05-23 20:58:49','2026-05-23 20:58:49'),(3,'ivanov@example.com','7777777777','$2y$12$IDrCDqQjqPx3vusn2ouMsOOB3eRrqDzpLGorbnEvCS.qgXKAALUN6',3,'2026-05-23 20:58:49','2026-05-23 20:58:49'),(4,'petrov@example.com','8888888888','$2y$12$N13.w4pgNRfsj..dz8wehuGeg3ohQYIguM4wBzHntMAG5ZLwzEE5W',3,'2026-05-23 20:58:50','2026-05-23 20:58:50');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_categories`
--

DROP TABLE IF EXISTS `vehicle_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_categories` (
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_categories`
--

LOCK TABLES `vehicle_categories` WRITE;
/*!40000 ALTER TABLE `vehicle_categories` DISABLE KEYS */;
INSERT INTO `vehicle_categories` VALUES ('A','Мотоциклы','2026-05-23 20:58:48','2026-05-23 20:58:48'),('B','Легковые автомобили','2026-05-23 20:58:48','2026-05-23 20:58:48'),('C','Грузовые автомобили','2026-05-23 20:58:48','2026-05-23 20:58:48'),('D','Автобусы','2026-05-23 20:58:48','2026-05-23 20:58:48'),('E','Прицепы','2026-05-23 20:58:48','2026-05-23 20:58:48');
/*!40000 ALTER TABLE `vehicle_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `client_id` bigint unsigned DEFAULT NULL,
  `state_number` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `model` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manufacture_year` year DEFAULT NULL,
  `power_hp` int DEFAULT NULL,
  `category` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vin` varchar(17) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purchase_price` decimal(12,2) DEFAULT NULL,
  `mileage` int NOT NULL DEFAULT '0',
  `has_tracker` tinyint(1) NOT NULL DEFAULT '0',
  `parking_type` enum('garage','street','parking_lot','other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vehicles_state_number_unique` (`state_number`),
  UNIQUE KEY `vehicles_vin_unique` (`vin`),
  KEY `vehicles_client_id_foreign` (`client_id`),
  KEY `vehicles_category_foreign` (`category`),
  CONSTRAINT `vehicles_category_foreign` FOREIGN KEY (`category`) REFERENCES `vehicle_categories` (`code`),
  CONSTRAINT `vehicles_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `client_profiles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicles`
--

LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
INSERT INTO `vehicles` VALUES (1,1,'А123ВС77','Toyota','Camry',2020,200,'B','JTDKW3D3X05123456',2500000.00,35000,1,'garage','2026-05-23 20:58:50','2026-05-23 20:58:50'),(2,2,'В456ЕО77','Hyundai','Solaris',2021,123,'B','KMHD3513LGU123456',1500000.00,15000,0,'street','2026-05-23 20:58:50','2026-05-23 20:58:50');
/*!40000 ALTER TABLE `vehicles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-24  3:01:26
