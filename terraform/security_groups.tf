# ==============================================================================
# CampusCorp Security Groups - Principle of Least Privilege
# ==============================================================================

# 1. ALB Security Group (Internet-facing HTTP/HTTPS)
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb-sg"
  description = "Controls inbound traffic to CampusCorp Application Load Balancer"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP from Internet (redirected to HTTPS)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from Internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Outbound to private app containers"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-alb-sg"
  }
}

# 2. ECS Application Security Group (Port 5000 from ALB only)
resource "aws_security_group" "ecs_app" {
  name        = "${var.project_name}-ecs-app-sg"
  description = "Allows traffic strictly from ALB to Node.js containers"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "REST API & WebSockets from ALB"
    from_port       = 5000
    to_port         = 5000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "Outbound to internet via NAT, S3 endpoints, and RDS"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-ecs-app-sg"
  }
}

# 3. ECS AI Microservice Security Group (Port 8000 from ECS App only)
resource "aws_security_group" "ecs_ai" {
  name        = "${var.project_name}-ecs-ai-sg"
  description = "Internal communication between Node backend and Python AI inference service"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "FastAPI AI inference from Node.js backend"
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_app.id]
  }

  egress {
    description = "Outbound to S3 for model weights"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-ecs-ai-sg"
  }
}

# 4. Amazon RDS MySQL Security Group (Port 3306 from ECS App only)
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Allows MySQL traffic ONLY from private ECS application tasks"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "MySQL connections from backend application tasks"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_app.id]
  }

  egress {
    description = "Outbound disabled for database tier"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}
