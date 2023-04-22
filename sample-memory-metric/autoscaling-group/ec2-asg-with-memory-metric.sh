launchTemplateName="asg-memory-metric-template"
asgName="memory-asg"

# Create launch template
launchTemplateId=$( \
aws ec2 create-launch-template \
    --launch-template-name $launchTemplateName \
    --version-description "AutoScalingGroup Template with memory metric" \
    --launch-template-data file://memory-lt.json \
    | jq -r '.LaunchTemplate | .LaunchTemplateId' \
    )

# Create ASG
aws autoscaling create-auto-scaling-group \
    --auto-scaling-group-name $asgName \
    --launch-template LaunchTemplateId=$launchTemplateId \
    --min-size 0 \
    --max-size 0


# Create EC2 ScaleOut Policy
scaleOutPolicy=$( \
aws autoscaling put-scaling-policy \
  --auto-scaling-group-name $asgName  \
  --policy-name ScaleOut-Memory \
  --policy-type StepScaling \
  --adjustment-type ChangeInCapacity \
  --metric-aggregation-type Average \
  --step-adjustments MetricIntervalLowerBound=0.0,ScalingAdjustment=1 \
  | jq -r '.PolicyARN' \
  )

# Create EC2 ScaleIn Policy
scaleInPolicy=$( \
aws autoscaling put-scaling-policy \
  --auto-scaling-group-name $asgName  \
  --policy-name ScaleIn-Memory \
  --policy-type StepScaling \
  --adjustment-type ChangeInCapacity \
  --metric-aggregation-type Average \
  --step-adjustments MetricIntervalUpperBound=0.0,ScalingAdjustment=-1 \
  | jq -r '.PolicyARN'
  )

# Create Alarm for ScaleOut
aws cloudwatch put-metric-alarm \
    --alarm-name Step-Scaling-AlarmHigh-MemoryUtilization-AddCapacity \
    --alarm-description "Memory metric Alarm High" \
    --metric-name "MemoryUtilization" \
    --namespace "EC2_ASG_Memory" \
    --dimensions "Name=AutoScalingGroupName,Value=$asgName" \
    --statistic Average \
    --threshold 30 \
    --period 60 \
    --evaluation-periods 3 \
    --comparison-operator GreaterThanThreshold \
    --alarm-actions $scaleOutPolicy

# Create Alarm for ScaleIn
aws cloudwatch put-metric-alarm \
    --alarm-name Step-Scaling-AlarmLow-MemoryUtilization-RemoveCapacity \
    --alarm-description "Memory metric Alarm Low" \
    --metric-name "MemoryUtilization" \
    --namespace "EC2_ASG_Memory" \
    --dimensions "Name=AutoScalingGroupName,Value=$asgName" \
    --statistic Average \
    --threshold 20 \
    --period 60 \
    --evaluation-periods 3 \
    --comparison-operator LessThanThreshold \
    --alarm-actions $scaleInPolicy

# Update AutoScalingGroup min-size 1 max-size 2
# Get the instance's public IP