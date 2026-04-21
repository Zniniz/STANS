output "public_ip" {
  description = "Public IP address of the STANS server"
  value       = aws_eip.stans.public_ip
}

output "public_dns" {
  description = "Public DNS of the STANS server"
  value       = aws_instance.stans.public_dns
}

output "instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.stans.id
}