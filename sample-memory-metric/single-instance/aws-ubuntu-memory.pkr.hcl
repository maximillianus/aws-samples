packer {
  required_plugins {
    amazon = {
      version = ">= 0.0.2"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

source "amazon-ebs" "ubuntu" {
  ami_name      = "learn-packer-linux-aws-cwagent"
  instance_type = "t3.nano"
  region        = "ap-southeast-1"
  source_ami_filter {
    filters = {
      name                = "ubuntu/images/*ubuntu-xenial-16.04-amd64-server-*"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["099720109477"]
  }
  ssh_username = "ubuntu"
  iam_instance_profile = "AWSEC2_CW_Agent"
  tags = {
    Name = "learn-packer-linux-aws-cwagent"
    project = "Packer"
  }

}

build {
  name = "learn-packer"
  sources = [
    "source.amazon-ebs.ubuntu"
  ]

  provisioner "shell" {
    environment_vars = [
      "region=ap-southeast-1",
      "ssm_param_name=ssm:/cwagent/linux/basic"
    ]
  inline = [
      "sudo apt-get update",
      "sudo apt-get install -y wget",
      "sudo apt-get install -y stress",
      "echo Downloading Cloudwatch Agent",
      "sleep 10",
      "wget https://s3.$region.amazonaws.com/amazoncloudwatch-agent-$region/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb",
      "echo Installing Cloudwatch Agent",
      "sudo dpkg -i -E ./amazon-cloudwatch-agent.deb",
      "echo Starting Cloudwatch Agent",
      "sleep 5",
      "sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c $ssm_param_name -s"
    ]
  }
}
