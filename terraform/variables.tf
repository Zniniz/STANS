variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.small"
}

variable "key_name" {
  description = "Name of the EC2 key pair (the .pem file name without extension)"
  type        = string
  default     = "STANS"
}

variable "github_token" {
  description = "GitHub Personal Access Token for cloning the repo"
  type        = string
  sensitive   = true   # won't appear in logs or plan output
}