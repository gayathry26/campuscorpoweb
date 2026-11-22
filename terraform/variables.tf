variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (e.g. production, staging)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project identifier"
  type        = string
  default     = "campuscorp"
}

variable "domain_name" {
  description = "Primary custom domain name for CampusCorp (e.g. campuscorp.com)"
  type        = string
  default     = "campuscorp.example.com"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "rds_instance_class" {
  description = "RDS DB instance class"
  type        = string
  default     = "db.t4g.medium"
}

variable "rds_allocated_storage" {
  description = "Initial allocated storage in GB"
  type        = number
  default     = 50
}

variable "rds_max_allocated_storage" {
  description = "Maximum storage auto-scaling threshold in GB"
  type        = number
  default     = 200
}

variable "rds_master_username" {
  description = "Master database administrator username"
  type        = string
  default     = "campusadmin"
}

variable "backend_cpu" {
  description = "Fargate CPU units for Node.js API container (1024 = 1 vCPU)"
  type        = number
  default     = 1024
}

variable "backend_memory" {
  description = "Fargate Memory in MB for Node.js API container"
  type        = number
  default     = 2048
}

variable "backend_min_capacity" {
  description = "Minimum running backend tasks"
  type        = number
  default     = 2
}

variable "backend_max_capacity" {
  description = "Maximum scaling capacity for backend tasks"
  type        = number
  default     = 8
}
