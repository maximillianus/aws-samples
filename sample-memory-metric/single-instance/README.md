# Memory metric in Single Instance

This guide describes how to create autoscaling based on memory metric

## Steps
1. Put CW Agent parameter in SSM. Parameter is in [`ssm-cw-agent-parameter.json`](./ssm-cw-agent-parameter.json)
   ```
   aws ssm put-parameter --name /cwagent/linux/basic --value file://ssm-cw-agent-parameter.json --type String
   ```
2. Create basic AMI using [Packer](https://www.packer.io/). [Packer file](./aws-ubuntu-memory.pkr.hcl) (Alternatively, there you can spin up your own AMI using the script `userdata.sh` in this repository)
3. Run shellscript [`ec2-with-memory-metric.sh`](./ec2-with-memory-metric.sh)
4. Do note that some configuration in `memory-lt.json` needs to be adjusted to your own:
   1. Security Group ID (Create security group with SSH access)
   2. SubnetId
   3. IAM Instance Profile (enable `CloudWatchAgentServerPolicy`, `CloudWatchAgentAdminPolicy`)
   4. AMI ID (Get from AMI created by Packer)
   5. KeyPair Name
5. Run stress test on memory
   ```
   ssh -i .ssh/private-key.pem ubuntu@$ec2PublicIp 'stress -m 1 --vm-bytes 600M -t 60s'
   ```

## Cleanup

Once done, remove all resources
```
# Terminate Instance
aws ec2 terminate-instances --instance-ids

# Delete Launch Template
aws ec2 delete-launch-template --launch-template-id $launchTemplateId

```