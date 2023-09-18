# Memory metric in Single Instance

This guide describes how to create an EC2 instance with Memory usage metric. The memory metric is emitted by Cloudwatch agent installed in the EC2 instance. Cloudwatch agent gets its configuration parameter from SSM Parameter Store.

## Steps
1. Create basic AMI using [Packer](https://www.packer.io/). [Packer file](./aws-ubuntu-memory.pkr.hcl) (Alternatively, there you can spin up your own AMI using the script `userdata.sh` in this repository)
2. Do note that some configuration in `memory-lt.json` needs to be adjusted to your own:
   1. Security Group ID (Create security group with SSH access)
   2. SubnetId
   3. Create IAM Instance Role (enable `CloudWatchAgentServerPolicy`, ``CloudWatchAgentAdminPolicy``)
   4. AMI ID (This AMI ID is Ubuntu 20.04 image for ap-southeast-1 region)
   5. KeyPair Name
3. Run shellscript [`deploy.sh`](./deploy.sh)
```
# Run it this way so that the parameter can be retained in your terminal after script exits
. ./deploy.sh
```
4. (*Optional*) Run stress test on memory
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