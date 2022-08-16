import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import {readFileSync} from 'fs';




export class EC2ApacheWebServer extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
  
        // The code that defines your stack goes here
    
        // example resource
        // const queue = new sqs.Queue(this, 'GenericCdkQueue', {
        //   visibilityTimeout: cdk.Duration.seconds(300)
        // });

        console.log('EC2 Apache Webserver');

        // 👇 import default VPC
        const vpc = ec2.Vpc.fromLookup(this, 'my-default-vpc', {
            isDefault: true,
        });

        // import Security Group
        const webServerSG = ec2.SecurityGroup.fromSecurityGroupId(
            this,
            'SSH-HTTP-HTTPS',
            'sg-0acaada88cf669ba3'
        );

        // Create EC2 Instance
        const ec2Instance = new ec2.Instance(this, 'ec2-instance', {
            vpc,
            vpcSubnets: {
            subnetType: ec2.SubnetType.PUBLIC,
            },
            securityGroup: webServerSG,
            instanceType: new ec2.InstanceType('t3a.micro'),
            machineImage: new ec2.AmazonLinuxImage({
            generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
            }),
        });

        // User Data
        const userDataScript = readFileSync('./lib/user-data/user-data-apache.sh', 'utf8');
        // 👇 add user data to the EC2 instance
        ec2Instance.addUserData(userDataScript);

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
            description: 'Ip Address of EC2',
            exportName: 'ec2PublicDNS',
        });
  
  console.log('ec2PublicIp 👉', ec2PublicIPOutput.value);
  console.log('ec2PublicDNS 👉', ec2PublicDNSOutput.value);
  


    }
  }
