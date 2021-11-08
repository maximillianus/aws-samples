# Tutorial how to install AWS RDS

This is tutorial to create a sample AWS RDS using AWS CDK.

## Tutorial
1. Install AWS CLI (macOS)
    ```
    curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
    sudo installer -pkg AWSCLIV2.pkg -target /
    which aws
    aws --version
    ```
1. Install AWS CDK
    ```
    npm -g install typescript
    npm -g install aws-cdk
    cdk --version
    ```
3. Run AWS CDK
```
cdk init app --language typescript
```