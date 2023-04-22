echo "Configuring launch template name"
launchTemplateName="ec2-memory-metric"

echo "Creating launch template"
# Create launch template
launchTemplateId=$( \
aws ec2 create-launch-template \
    --launch-template-name $launchTemplateName \
    --version-description "EC2 Template with memory metric" \
    --launch-template-data file://memory-lt.json \
    | jq -r '.LaunchTemplate | .LaunchTemplateId' \
    )

echo "Creating instance"
# Create Instance from template
aws ec2 run-instances \
    --launch-template LaunchTemplateId=$launchTemplateId \