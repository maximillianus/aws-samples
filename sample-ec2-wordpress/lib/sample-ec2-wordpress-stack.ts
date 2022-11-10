import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import { readFileSync } from "fs";

export class SampleEC2WordpressStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    console.log(`Deploying ${this.stackName}`);

    // 👇 import default VPC
    const vpc = ec2.Vpc.fromLookup(this, "my-default-vpc", {
      isDefault: true
    });

    // import Security Group
    const webServerSG = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      "SSH-HTTP-HTTPS",
      "sg-0acaada88cf669ba3"
    );

    const ec2Role = iam.Role.fromRoleName(
      this,
      "ec2-instance-role",
      "AWSEC2SSMDefaultManagedRole"
    );

    // Create EC2 Instance
    const ec2Instance = new ec2.Instance(this, "my-ec2-instance", {
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC
      },
      securityGroup: webServerSG,
      instanceType: new ec2.InstanceType("t3a.micro"),
      machineImage: new ec2.GenericLinuxImage({
        "ap-southeast-1": "ami-04ff9e9b51c1f62ca"
      }),
      keyName: "isengard-apradana-test1",
      role: ec2Role,
      // resourceSignalTimeout: cdk.Duration.minutes(10)
    });

    // User Data
    const userDataScript = readFileSync(
      "./lib/user-data/user-data-wordpress.sh",
      "utf8"
    );
    ec2Instance.addUserData(userDataScript);
    ec2Instance.userData.addCommands(
      `/opt/aws/bin/cfn-signal -e $? --stack ${cdk.Aws.STACK_NAME} --resource ${
        (ec2Instance.node.defaultChild as cdk.CfnElement).logicalId
      } --region ${cdk.Aws.REGION}
      `
    );

    // Outputs
    // Public IP
    // 👇 assign Output to a variable
    const ec2PublicIPOutput = new cdk.CfnOutput(this, "ec2-public-ip", {
      value: ec2Instance.instancePublicIp,
      description: "Ip Address of EC2",
      exportName: "ec2PublicIp"
    });
    const ec2PublicDNSOutput = new cdk.CfnOutput(this, "ec2-public-dns", {
      value: ec2Instance.instancePublicDnsName,
      description: "Ip Address of EC2",
      exportName: "ec2PublicDNS"
    });

    const cfnCreationPolicy: cdk.CfnCreationPolicy = {
      resourceSignal: {
        count: 1,
        timeout: 'PT10M',
      },
    };

    // (ec2Instance.node.defaultChild as cdk.aws_ec2.CfnInstance).cfnOptions.creationPolicy = cfnCreationPolicy;
    ec2Instance.instance.cfnOptions.creationPolicy = cfnCreationPolicy;

    console.log("ec2PublicIp 👉", this.resolve(ec2PublicIPOutput.value));
    console.log("ec2PublicDNS 👉", this.resolve(ec2PublicDNSOutput.value));
    console.log(
      "Unique Logical ID 👉",
      this.resolve(ec2Instance.instance.logicalId)
    );
  }
}
