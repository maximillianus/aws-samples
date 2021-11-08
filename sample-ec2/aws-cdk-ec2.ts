import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';

export class CdkEc2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
      const vpc = ec2.Vpc.fromLookup(this, 'VPC', {
        // This imports the default VPC but you can also
        // specify a 'vpcName' or 'tags'.
        isDefault: true,
      });

      const securityGroup = new ec2.SecurityGroup(
        this,
        'simple-cdk-sg-1',
        {
          vpc: vpc,
          allowAllOutbound: true,
          securityGroupName: 'simple-cdk-sg-1'
        }
      )
      securityGroup.addIngressRule(
        ec2.Peer.anyIpv4(),
        ec2.Port.tcp(22),
        'Allows SSH access from Internet'
      )
  
      securityGroup.addIngressRule(
        ec2.Peer.anyIpv4(),
        ec2.Port.tcp(80),
        'Allows HTTP access from Internet'
      )
  
      securityGroup.addIngressRule(
        ec2.Peer.anyIpv4(),
        ec2.Port.tcp(443),
        'Allows HTTPS access from Internet'
      )

      // const role = iam.Role.fromRoleArn(this, 'Role', 'arn:aws:iam::860873776111:role/AWSEC2SSMDefaultManagedRole', {
      //   // Set 'mutable' to 'false' to use the role as-is and prevent adding new
      //   // policies to it. The default is 'true', which means the role may be
      //   // modified as part of the deployment.
      //   mutable: false,
      // });

      // Finally lets provision our ec2 instance
      const instance = new ec2.Instance(this, 'simple-instance-1', {
        vpc: vpc,
        // role: role,
        securityGroup: securityGroup,
        instanceName: 'ec2-cdk-instance-1',
        instanceType: ec2.InstanceType.of( // t2.micro has free tier usage in aws
          ec2.InstanceClass.T3,
          ec2.InstanceSize.SMALL
        ),
        // machineImage: ec2.MachineImage.latestAmazonLinux({
        //   generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        // }),
        machineImage: ec2.MachineImage.genericLinux({
          'ap-southeast-3': 'ami-00cecce62f6f6b6cb',
          'ap-southeast-1': 'ami-07191cf2912e097a6'
        })

        // keyName: 'simple-instance-1-key', // we will create this in the console before we deploy
      })
  



  }
}
