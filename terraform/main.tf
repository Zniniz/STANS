terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ── Data sources ─────────────────────────────────────────────────

# Look up the latest Ubuntu 22.04 AMI automatically
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]   # Canonical (Ubuntu's publisher)

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ── Security Group ────────────────────────────────────────────────

resource "aws_security_group" "stans" {
  name        = "stans-sg"
  description = "Security group for STANS application server"

  # SSH — restrict to your IP in production
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]   # TODO: replace with your IP/32
  }

  # HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Grafana
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "stans-sg"
    Project = "STANS"
  }
}

# ── Elastic IP ────────────────────────────────────────────────────

resource "aws_eip" "stans" {
  instance = aws_instance.stans.id
  domain   = "vpc"

  tags = {
    Name    = "stans-eip"
    Project = "STANS"
  }
}

# ── EC2 Instance ──────────────────────────────────────────────────

resource "aws_instance" "stans" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.stans.id]

  # User data runs once on first boot — installs Docker and clones repo
  user_data = <<-EOF
    #!/bin/bash
    set -e

    # Update system
    apt-get update && apt-get upgrade -y

    # Install Docker
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker ubuntu
    apt-get install -y docker-compose-plugin

    # Install nginx and Certbot
    apt-get install -y nginx certbot python3-certbot-nginx

    # Configure firewall
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 3000/tcp
    ufw --force enable

    # Clone the repo as ubuntu user
    sudo -u ubuntu git clone https://${var.github_token}@github.com/Zniniz/STANS.git /home/ubuntu/stans

    # Start the application stack
    cd /home/ubuntu/stans
    sudo -u ubuntu docker compose up -d
  EOF

  root_block_device {
    volume_size = 20   # GB
    volume_type = "gp3"
  }

  tags = {
    Name    = "stans-server"
    Project = "STANS"
  }
}