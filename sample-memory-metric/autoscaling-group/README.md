# Memory metric in Autoscaling Group

This guide describes how to create autoscaling based on memory metric

## Steps
1. Put CW Agent parameter in SSM. Parameter is in [`ssm-cw-agent-parameter.json`](./ssm-cw-agent-parameter.json)
   ```
   aws ssm put-parameter --name /cwagent/linux/asg-memory --value file://ssm-cw-agent-parameter.json --type String
   ```
2. Create basic AMI using [Packer](https://www.packer.io/). [Packer file](./aws-ubuntu-asg-memory.pkr.hcl)
3. Run shellscript [`ec2-asg-with-memory-metric.sh`](./ec2-asg-with-memory-metric.sh)
4. Do note that some configuration in `memory-lt.json` needs to be adjusted to your own:
   1. Security Group ID (Create security group with SSH access)
   2. SubnetId
   3. IAM Instance Profile (enable `CloudWatchAgentServerPolicy`, `CloudWatchAgentAdminPolicy`)
   4. AMI ID (Get from AMI created by Packer)
5. Update instance in Autoscaling Group to 1 (min-size 1, max-size 2)
6. Get the instance's Public IP
7. Run stress test on memory
   ```
   ssh -i .ssh/private-key.pem ubuntu@$ec2PublicIp 'stress -m 1 --vm-bytes 600M -t 300s'
   ```

## Cleanup

Once done, remove all resources
```
# Delete Alarms
aws cloudwatch delete-alarms --alarm-names Step-Scaling-AlarmHigh-MemoryUtilization-AddCapacity Step-Scaling-AlarmLow-MemoryUtilization-RemoveCapacity

# Delete Scaling Policy
aws autoscaling delete-policy --policy-name ScaleIn-Memory --auto-scaling-group-name memory-asg \
aws autoscaling delete-policy --policy-name ScaleOut-Memory --auto-scaling-group-name memory-asg

# Delete AutoScalingGroup
aws autoscaling delete-auto-scaling-group --auto-scaling-group-name memory-asg

# Delete Launch Template
aws ec2 delete-launch-template --launch-template-id $launchTemplateId

```