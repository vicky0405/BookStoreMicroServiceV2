-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: user-service
-- ------------------------------------------------------
-- Server version	8.0.44

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
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin'),(4,'enduser'),(5,'ordmanager'),(6,'shipper'),(3,'warehouse');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gender` tinyint(1) DEFAULT NULL,
  `role_id` int NOT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','123456','Bao Bao','admin@gmail.com','',1,1,1,'2024-12-31 18:00:00','2024-12-31 18:00:00'),(3,'warehouse1','$2b$10$sAgAAKU/x/324JT.mtV/M.RLPW7l5nFJrEdQKXiUrVcKT1djp0anW','BaoC','warehouse1@gmail.com','0282843582',0,3,1,'2024-12-31 18:20:00','2024-12-31 18:20:00'),(4,'warehouse2','$2b$10$DnXPR8xsPrp4lxe2ugdKY.dx8H6heNxVZPWN.BSWFEiXm4kpHA.Mm','Bao Baoa','warehouse2@gmail.com','0271927190',0,3,1,'2024-12-31 18:30:00','2024-12-31 18:30:00'),(5,'order','$2b$10$3lLRY.Y24snpj814CtIPVOMP8eSgnrKHVQYY8oL8dLqYgRF2A7m3y','abcd f','order@gmail.com','0183618342',0,5,1,'2025-07-11 07:00:29','2025-07-11 07:00:29'),(6,'customer','$2b$10$jN0SAOb//k6Au2eTkwu3NOjoWXiMtFCJ/A1900u8BGeTG0vmTCSSG','bbb','abcs@gmail.com','0372917211',0,4,1,'2025-07-11 07:09:07','2025-07-11 07:09:07'),(7,'shipper1','$2b$10$.ijibJLLkqeG62ZHm8VvSO.yZPqVyEU7wTk/DVqWpajTzr83NNr8m','Nguyễn Văn A','hoanam328@gmail.com','0271927199',0,6,1,'2025-07-15 07:30:59','2025-07-15 07:30:59'),(15,'shipper2','$2b$10$0QQX/68P.NJVPjAUCBtoF.DTg4a4u2mvWCOpvlcpHshr45kaeR0j6','Charlie','hoanam320@gmail.com','0271927198',0,6,1,'2025-07-15 08:27:37','2025-07-15 08:27:37'),(16,'aaaa','$2b$10$uA4ICqbRKzf0rNrE/yjWueG4RtB5SCQcMDdf6bxVrWPAobyOlkFAO','aaaa','tuongv03v@gmail.com','0854451366',0,4,1,'2025-11-09 08:49:27','2025-11-09 08:49:27');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-12  7:04:26
