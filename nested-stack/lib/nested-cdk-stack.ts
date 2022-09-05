import {Construct} from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';

// 👇 extends NestedStack
class VpcNestedStack extends cdk.NestedStack {
  public readonly vpc: ec2.IVpc;
  public readonly webServerSG: ec2.ISecurityGroup;
  public readonly ec2Role: iam.IRole;

  constructor(scope: Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id, props);

    //👇 import default VPC
    this.vpc = ec2.Vpc.fromLookup(this, 'DefaultVPC', {
      isDefault: true,
    });

    // import Security Group
    this.webServerSG = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      'SSH-HTTP-HTTPS',
      'sg-0acaada88cf669ba3',
    );

    // import existing Role
    this.ec2Role = iam.Role.fromRoleName(
      this,
      'ec2-instance-role',
      'AWSEC2SSMDefaultManagedRole',
    );
  }
}

export class SampleEC2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    console.log(`Deploying ${this.stackName}`);

    const { vpc, webServerSG, ec2Role } = new VpcNestedStack(this, 'nested-stack-vpc', {});

    // const handle = new ec2.InitServiceRestartHandle();

    const cfnAutoReloaderHookContent = [
      `[cfn-auto-reloader-hook]\n`,
      `triggers=post.update\n`,
      `path=Resources.WebServer.Metadata.AWS::CloudFormationInit\n`,
      `action=/opt/aws/bin/cfn-init -v `,
      `--stack ${cdk.Aws.STACK_NAME} `,
      `--resource WebServer `,
      `--configsets default `,
      `--region ${cdk.Aws.REGION}\n`,
    ].join('')

    const cfnHupConfigContent = [
      `[main]\n`,
      `stack=${cdk.Aws.STACK_ID}\n`,
      `region=${cdk.Aws.REGION}\n`,
      `interval=5\n`,
      `verbose=true\n`,
    ].join('')

    // Create EC2 Instance
    const ec2Instance = new ec2.Instance(this, 'my-ec2-instance', {
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroup: webServerSG,
      instanceType: new ec2.InstanceType('t3a.nano'),
      // machineImage: new ec2.GenericLinuxImage({
      //   'ap-southeast-1': 'ami-04ff9e9b51c1f62ca',
      // }),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
      }),
      keyName: 'isengard-apradana-test1',
      role: ec2Role,
      instanceName: 'CDK-EC2',
      propagateTagsToVolumeOnCreation: true,
      init: ec2.CloudFormationInit.fromConfigSets({
        configSets: {
          default: [
            'upgrade_yum',
            'install_cfn',
            'install_packages',
            'start_services',
            'echo_success'
          ]
        },
        configs: {
          upgrade_yum: new ec2.InitConfig([
            ec2.InitCommand.shellCommand('yum update -y', {key: '01_update_yum'})
          ]),
          install_cfn: new ec2.InitConfig([
            ec2.InitFile.fromString(
              '/etc/cfn/cfn-hup.conf',
              cfnHupConfigContent,
              {
                mode: '00400',
                owner: 'root',
                group: 'root',
              }
            ),
            ec2.InitFile.fromString(
              '/etc/cfn/hooks.d/cfn-auto-reloader.conf',
              '# Override later for cleaner logicalId support',
              {
                mode: '00400',
                owner: 'root',
                group: 'root',
              }
            )
          ]),
          install_packages: new ec2.InitConfig([
            ec2.InitPackage.yum('httpd'),
            ec2.InitPackage.yum('git'),
            ec2.InitPackage.yum('tmux'),
          ]),
          start_services: new ec2.InitConfig([
            ec2.InitService.enable('cfn-hup', {
              enabled: true,
              ensureRunning: true,
              // serviceRestartHandle: handle
            }),
            ec2.InitService.enable('httpd', {
              enabled: true,
              ensureRunning: true,
              // serviceRestartHandle: handle
            })
          ]),
          echo_success: new ec2.InitConfig([
            ec2.InitCommand.shellCommand('echo "+*+*+*+CFN-HUP+*+*+*+Working Well++++++"',
            {key: '01_echo_success'})
          ]),
        }
      }),
      resourceSignalTimeout: cdk.Duration.minutes(10)
      // initOptions: {
      //   configSets: ['default'],
      //   timeout: cdk.Duration.minutes(10)
      // }
    });

    // Overriding

    const cfnAutoReloaderHookContent2 = [
      `[cfn-auto-reloader-hook]\n`,
      `triggers=post.update\n`,
      `path=Resources.${ec2Instance.instance.logicalId}.Metadata.AWS::CloudFormationInit\n`,
      `action=/opt/aws/bin/cfn-init -v `,
      `--stack ${cdk.Aws.STACK_NAME} `,
      `--resource ${ec2Instance.instance.logicalId} `,
      `--configsets default `,
      `--region ${cdk.Aws.REGION}\n`,
    ].join('')

    ec2Instance.instance.addOverride(
      'Metadata.AWS::CloudFormation::Init'+
      '.install_cfn'+
      '.files'+
      './etc/cfn/hooks\\.d/cfn-auto-reloader\\.conf.content',
      cfnAutoReloaderHookContent2
    )

    // Outputs
    // Public IP
    // 👇 assign Output to a variable
    const ec2PublicIPOutput = new cdk.CfnOutput(this, 'ec2-public-ip', {
      value: ec2Instance.instancePublicIp,
      description: 'Ip Address of EC2',
      exportName: 'ec2PublicIp',
    });
    const ec2PublicDNSOutput = new cdk.CfnOutput(this, 'ec2-public-dns', {
      value: ec2Instance.instancePublicDnsName,
      description: 'DNS Address of EC2',
      exportName: 'ec2PublicDNS',
    });

  }
}
