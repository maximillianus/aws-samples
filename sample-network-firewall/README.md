# Sample EC2 using AWS CDK

This is tutorial to create a sample Network Firewall in AWS. Network Firewall is useful as IDS/IPS system to inspect and filter traffic in and out your VPC.

## Tutorial
1. Install AWS CLI (macOS)
    ```
    curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
    sudo installer -pkg AWSCLIV2.pkg -target /
    which aws
    aws --version
    ```
2. Install AWS CDK
    ```
    npm -g install typescript
    npm -g install aws-cdk
    cdk --version
    ```
3. Install the necessary dependencies
    ```
    npm i
    ```
4. Deploy the infrastructure
    ```
    npx cdk deploy
    ```
