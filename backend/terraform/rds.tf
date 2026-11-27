# ==============================================================================
# CampusCorp Amazon RDS for MySQL - Multi-AZ Enterprise Database Tier
# ==============================================================================

# Subnet Group across isolated database subnets
resource "aws_db_subnet_group" "rds" {
  name        = "${var.project_name}-rds-subnet-group"
  description = "CampusCorp private isolated database subnets"
  subnet_ids  = [aws_subnet.private_db_1.id, aws_subnet.private_db_2.id]

  tags = {
    Name = "${var.project_name}-rds-subnet-group"
  }
}

# Parameter Group for MySQL 8.0 / MariaDB 10.4
resource "aws_db_parameter_group" "mysql" {
  name        = "${var.project_name}-mysql-params"
  family      = "mysql8.0"
  description = "Optimized parameters for CampusCorp multi-tenant LMS"

  parameter {
    name  = "character_set_server"
    value = "utf8mb4"
  }

  parameter {
    name  = "collation_server"
    value = "utf8mb4_unicode_ci"
  }

  parameter {
    name  = "max_connections"
    value = "500"
  }

  parameter {
    name  = "wait_timeout"
    value = "600"
  }
}

# Master Password generated securely in AWS Secrets Manager
resource "random_password" "rds_master" {
  length  = 24
  special = false
}

resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "${var.project_name}/${var.environment}/database"
  description             = "CampusCorp Master Database Credentials"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    host     = aws_db_instance.mysql.address
    port     = aws_db_instance.mysql.port
    username = var.rds_master_username
    password = random_password.rds_master.result
    database = "campuscorp_platform"
  })
}

# Amazon RDS MySQL Multi-AZ Instance
resource "aws_db_instance" "mysql" {
  identifier             = "${var.project_name}-${var.environment}-db"
  engine                 = "mysql"
  engine_version         = "8.0.35"
  instance_class         = var.rds_instance_class
  allocated_storage      = var.rds_allocated_storage
  max_allocated_storage  = var.rds_max_allocated_storage
  storage_type           = "gp3"
  storage_encrypted      = true

  db_name  = "campuscorp_platform"
  username = var.rds_master_username
  password = random_password.rds_master.result
  port     = 3306

  multi_az               = true
  publicly_accessible    = false
  db_subnet_group_name   = aws_db_subnet_group.rds.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.mysql.name

  backup_retention_period   = 14
  backup_window             = "03:00-04:00"
  maintenance_window        = "Sun:04:30-Sun:05:30"
  auto_minor_version_upgrade = true
  deletion_protection       = true
  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.project_name}-final-snapshot"

  performance_insights_enabled    = true
  performance_insights_retention_period = 7

  tags = {
    Name        = "${var.project_name}-mysql-rds"
    Environment = var.environment
  }
}
