provider "aws" {
  region = "us-east-1"
}

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  enable_dns_support = true
  enable_dns_hostnames = true
}

resource "aws_subnet" "subnet_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true
}

resource "aws_subnet" "subnet_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = true
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

}

resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.main.id
}


resource "aws_route" "internet_route" {
  route_table_id         = aws_route_table.public_route_table.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.gw.id
}

resource "aws_route_table_association" "public_subnet_assoc" {
  subnet_id      = aws_subnet.subnet_1.id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_route_table_association" "public_association_2" {
  subnet_id      = aws_subnet.subnet_2.id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_security_group" "ec2_sg_frontend" {
  name        = "ec2_sg_frontend_terraform"
  vpc_id = aws_vpc.main.id
  description = "Allow inbound traffic for EC2 instances"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
resource "aws_security_group" "ec2_sg_backend" {
  name        = "ec2_sg_backend_terraform"
  vpc_id = aws_vpc.main.id
  description = "Allow inbound traffic for EC2 instances"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "rds_sg" {
  name        = "rds_sg"
  description = "Allow inbound traffic for RDS MySQL"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "my_instance_backend" {
  ami           = "ami-06b21ccaeff8cd686"
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.subnet_1.id
  vpc_security_group_ids = [aws_security_group.ec2_sg_backend.id]
  key_name               = "connect"

  tags = {
    Name = "ConnectMessengerTerraformBackend"
  }
}

resource "aws_instance" "my_instance_frontend" {
  ami           = "ami-06b21ccaeff8cd686"
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.subnet_1.id
  vpc_security_group_ids = [aws_security_group.ec2_sg_frontend.id]
  key_name               = "connect"

  tags = {
    Name = "ConnectMessengerTerraformFrontend"
  }
}


resource "aws_cognito_user_pool" "user_pool" {
  name = "ConnectMessengerTerraform"

  username_attributes = ["email"]

  auto_verified_attributes = ["email"]

  schema {
    name     = "email"
    required = true
    mutable  = true
    developer_only_attribute = false
    attribute_data_type = "String"
  }

  password_policy {
    minimum_length    = 8
    require_uppercase = true
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
  }
}

resource "aws_db_instance" "db_instance" {
  allocated_storage    = 20
  storage_type         = "gp3"
  engine               = "mysql"
  engine_version       = "8.0.39"
  instance_class       = "db.t4g.micro"
  username             = "root"
  password             = ""
  db_subnet_group_name = aws_db_subnet_group.db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  publicly_accessible  = true
}

resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "connect_messenger_subnet_group_terraform"
  subnet_ids = [aws_subnet.subnet_1.id, aws_subnet.subnet_2.id]
}

resource "aws_cognito_user_pool_client" "app_client" {
  name              = "my_app_client_terraform"
  user_pool_id      = aws_cognito_user_pool.user_pool.id
  generate_secret   = true
  allowed_oauth_flows = ["code"]
  allowed_oauth_scopes = ["openid", "email"]
  allowed_oauth_flows_user_pool_client = true

  callback_urls = ["https://${aws_instance.my_instance_backend.public_ip}.nip.io/login/oauth2/code/cognito"]
  logout_urls   = ["https://${aws_instance.my_instance_backend.public_ip}.nip.io/logout"]

  supported_identity_providers = ["COGNITO"]

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH"
  ]
}

resource "aws_cognito_user_pool_domain" "main" {
  domain       = "connect-messenger2"
  user_pool_id = aws_cognito_user_pool.user_pool.id
}

output "ec2_frontend_public_ip" {
  value = aws_instance.my_instance_frontend.public_ip
}

output "ec2_backend_public_ip" {
  value = aws_instance.my_instance_backend.public_ip
}

output "rds_endpoint" {
  value = aws_db_instance.db_instance.endpoint
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.app_client.id
}

output "cognito_client_secret" {
  sensitive = true
  value = aws_cognito_user_pool_client.app_client.client_secret
}

output "cognito_client_name" {
  value = aws_cognito_user_pool_client.app_client.name
}

output "user-pool-id" {
  value = aws_cognito_user_pool.user_pool.id
}
