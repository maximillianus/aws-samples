import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Duration, SecretValue } from 'aws-cdk-lib';
// import { Secret } from 'aws-cdk/core';

export class SampleRdsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const vpc = ec2.Vpc.fromLookup(this, "VPC", {
      isDefault: true
    })

    const secret = SecretValue.unsafePlainText('admin123')

    // import Security Group
    const webServerSG = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      "rds-secure-access",
      "sg-00327f911ceb0c11e"
    );

    const subnetGroup = rds.SubnetGroup.fromSubnetGroupName(this, 'CDK-RDS-SubnetGroup', 'default')

    const rdsInstance = new rds.DatabaseInstance(this, 'Instance', {
      // engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_0_25 }),
      engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_5_7_37 }),
      // optional, defaults to m5.large
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
      instanceIdentifier: 'rds-cdk-mysql',
      multiAz: false,
      storageType: rds.StorageType.GP2,
      allocatedStorage: 20,
      autoMinorVersionUpgrade: false,
      databaseName: 'cdk_rds_db',
      backupRetention: Duration.days(1),
      monitoringInterval: Duration.seconds(60),
      // credentials: rds.Credentials.fromGeneratedSecret('syscdk'), // Optional - will default to 'admin' username and generated password
      credentials: rds.Credentials.fromPassword('admin', secret
      ),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroups: [webServerSG],
      publiclyAccessible: false,
      deletionProtection: false
    });
  }
}
