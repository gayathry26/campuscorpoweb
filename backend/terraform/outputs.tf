output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID"
  value       = aws_cloudfront_distribution.cdn.id
}

output "cloudfront_domain_name" {
  description = "CloudFront Global CDN Domain Name"
  value       = aws_cloudfront_distribution.cdn.domain_name
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS Name"
  value       = aws_lb.main.dns_name
}

output "rds_endpoint" {
  description = "Amazon RDS MySQL Endpoint"
  value       = aws_db_instance.mysql.endpoint
}

output "rds_address" {
  description = "Amazon RDS MySQL Hostname"
  value       = aws_db_instance.mysql.address
}

output "frontend_s3_bucket" {
  description = "S3 Bucket Name for Frontend Static Assets"
  value       = aws_s3_bucket.frontend.id
}

output "uploads_s3_bucket" {
  description = "S3 Bucket Name for Private Document Uploads"
  value       = aws_s3_bucket.uploads.id
}

output "secrets_manager_arn" {
  description = "AWS Secrets Manager Secret ARN for Database"
  value       = aws_secretsmanager_secret.db_credentials.arn
}
