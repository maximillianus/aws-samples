echo "Configuring parameters"
ssmParameter="/cwagent/linux/basic-2"
ssmParameterFile="file://ssm-cw-agent-parameter.json"
launchTemplateName="ec2-memory-metric"
launchTemplateFile="file://memory-lt.json.test"

echo "Create SSM Parameter"
aws ssm put-parameter \
    --name $ssmParameter \
    --value $ssmParameterFile \
    --type String

echo "Creating launch template"
# Create launch template
launchTemplateId=$( \
aws ec2 create-launch-template \
    --launch-template-name $launchTemplateName \
    --version-description "EC2 Template with memory metric" \
    --launch-template-data $launchTemplateFile \
    | jq -r '.LaunchTemplate | .LaunchTemplateId' \
    )
echo "Launch Template ID: $launchTemplateId"

echo "Creating instance"
# Create Instance from template
instanceId=$(aws ec2 run-instances \
    --launch-template LaunchTemplateId=$launchTemplateId \
    | jq -r '.Instances[0] | .InstanceId' \
    )

instancePublicIp=$(aws ec2 describe-instances \
    --instance-ids $instanceId \
    --query 'Reservations[*].Instances[*].PublicIpAddress' \
    --output text
    )

echo "Instance ID: $instanceId"
echo "Instance Public IP: $instancePublicIp"