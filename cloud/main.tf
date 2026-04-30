# AWS EKS Cluster with Terraform (Infrastructure as Code)

provider "aws" {
  region = "us-east-1"
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  name   = "afro-space-vpc"
  cidr   = "10.0.0.0/16"
  # ... subnets, etc
}

module "eks" {
  source          = "terraform-aws-modules/eks/aws"
  cluster_name    = "afro-space-cluster"
  cluster_version = "1.27"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets

  eks_managed_node_groups = {
    general = {
      desired_size = 3
      max_size     = 10
      min_size     = 2
      instance_types = ["t3.medium"]
    }
  }
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "postgres" {
  identifier        = "afro-space-db"
  engine            = "postgres"
  instance_class    = "db.t3.medium"
  allocated_storage = 20
  username          = "afroadmin"
  password          = "SECURE_PASSWORD_CHANGE_ME"
  # ...
}
