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

    // import existing Role
    const ec2Role = iam.Role.fromRoleName(
      this,
      "ec2-instance-role",
      "AWSEC2SSMDefaultManagedRole"
    );

    const userDataScript = readFileSync(
      "./lib/user-data/install-cfn-helper.sh",
      "utf8"
    );

    const userData = ec2.UserData.forLinux();
    userData.addCommands(userDataScript);

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
      userData: userData,
      init: ec2.CloudFormationInit.fromConfigSets({
        configSets: {
          default: [
            "upgrade_apt",
            "install_lamp",
            "install_wordpress",
            "start_apache"
          ]
        },
        configs: {
          upgrade_apt: new ec2.InitConfig([
            ec2.InitCommand.shellCommand("apt upgrade -y", {
              key: "01_upgrade_apt"
            })
          ]),
          install_lamp: new ec2.InitConfig([
            ec2.InitPackage.apt("apache2"),
            ec2.InitPackage.apt("php"),
            ec2.InitPackage.apt("php-dev"),
            ec2.InitPackage.apt("php-mysql")
          ]),
          install_wordpress: new ec2.InitConfig([
            ec2.InitCommand.shellCommand(
              "wget https://wordpress.org/latest.tar.gz \n",
              {
                key: "01_download_wordpress"
              }
            ),
            ec2.InitCommand.shellCommand(
              "tar -xvzf latest.tar.gz \n" + "cp -r wordpress/* /var/www/html",
              {
                key: "02_extract_wordpress"
              }
            ),
            ec2.InitCommand.shellCommand(
              "rm -rf wordpress latest.tar.gz \n" +
                "rm -rf /var/www/html/index.html",
              {
                key: "03_remove_dump"
              }
            ),
            ec2.InitCommand.shellCommand(
              "chown -R www-data:www-data /var/www/html",
              {
                key: "04_change_grp_ownership"
              }
            )
          ]),
          start_apache: new ec2.InitConfig([
            ec2.InitService.enable("apache2", {
              enabled: true,
              ensureRunning: true
            })
          ])
        }
      }),
      resourceSignalTimeout: cdk.Duration.minutes(5)
    });

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

    // console.log('Unique Logical ID 👉', this.resolve((ec2Instance.node.defaultChild as cdk.CfnElement).logicalId));
    console.log(
      "Unique Logical ID 👉",
      this.resolve(ec2Instance.instance.logicalId)
    );
  }
}
