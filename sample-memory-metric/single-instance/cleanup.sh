# CleanUp Script

# Terminate Instance
echo "Deleting instance"
aws ec2 terminate-instances --instance-ids $instanceId

# Delete Launch Template
echo "Deleting launch template"
aws ec2 delete-launch-template --launch-template-id $launchTemplateId

# Delete SSM Parameter
echo "Deleting SSM parameter"
aws ssm delete-parameter --name $ssmParameter
