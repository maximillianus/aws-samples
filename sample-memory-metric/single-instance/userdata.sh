#!/bin/bash
region=ap-southeast-1
ssm_param_name=ssm:/cwagent/linux/basic-2
apt-get update -y
apt-get install -y wget stress
echo Downloading Cloudwatch Agent
sleep 3
wget https://s3.$region.amazonaws.com/amazoncloudwatch-agent-$region/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
echo Installing Cloudwatch Agent
dpkg -i -E ./amazon-cloudwatch-agent.deb
echo Starting Cloudwatch Agent
sleep 3
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c $ssm_param_name -s