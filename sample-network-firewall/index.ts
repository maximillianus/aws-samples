#!/usr/bin/env node
import 'source-map-support/register';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { aws_networkfirewall as networkfirewall } from 'aws-cdk-lib';

export class SampleNetworkFirewall extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'vpc', {
      maxAzs: 1,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: 'Customer-Subnet',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
          mapPublicIpOnLaunch: true
        },
        {
          name: 'Network-FW-Subnet',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
          mapPublicIpOnLaunch: true
        }
      ]
    });

    // Assigning subnets to constants to be easily referenced later
    const customerSubnet = vpc.selectSubnets({
      subnetGroupName:'Customer-Subnet'
    }).subnets[0];
    const networkFirewallSubnet = vpc.selectSubnets({
      subnetGroupName:'Network-FW-Subnet'
    }).subnets[0];

    // Route Tables
    const IGWRouteTable = new ec2.CfnRouteTable(this, 'IGWRouteTable', {
      vpcId: vpc.vpcId,
      tags: [{
        key: 'Name',
        value: this.stackName + '-IGWRouteTable',
      }]
    });

    const NetworkFWSubnetRouteTable = new ec2.CfnRouteTable(this, 'NetworkFWSubnetRouteTable', {
      vpcId: vpc.vpcId,
      tags: [{
        key: 'Name',
        value: this.stackName + '-NetworkFWSubnetRouteTable',
      }]
    });

    const CustomerSubnetRouteTable = new ec2.CfnRouteTable(this, 'CustomerSubnetRouteTable', {
      vpcId: vpc.vpcId,
      tags: [{
        key: 'Name',
        value: this.stackName + '-CustomerSubnetRouteTable',
      }]
    });

    // EC2 Instance
    const sshOnlySG = new ec2.SecurityGroup(this, this.stackName + '-SG', {
      vpc,
      allowAllOutbound: true,
      description: 'security group for SSH'
    })
    sshOnlySG.connections.allowFrom(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'allow SSH access from anywhere'
    );
    cdk.Tags.of(sshOnlySG).add('Name', this.stackName + '-SG')

    // Having Role is optional, I am omitting it for now
    // const ec2Role = iam.Role.fromRoleName(
    //   this,
    //   "ec2-instance-role",
    //   "AWSEC2SSMDefaultManagedRole"
    // );

    const ec2Instance = new ec2.Instance(this, 'test-network-cdk-ec2', {
      vpc: vpc,
      securityGroup: sshOnlySG,
      vpcSubnets: {
        subnetGroupName: 'Customer-Subnet'
      },
      instanceType: new ec2.InstanceType("t3a.micro"),
      machineImage: ec2.MachineImage.lookup({
        name: 'ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64*',
        owners: ['amazon']
      }),
      blockDevices: [
        {
          deviceName: '/dev/sda1',
          volume: ec2.BlockDeviceVolume.ebs(8)
        }
      ],
      propagateTagsToVolumeOnCreation: true
    });


    // Network Firewall - Rule Groups
    const statelessRuleGroup1 = new networkfirewall.CfnRuleGroup(this, 'statelessRuleGroup1', {
      capacity: 10,
      ruleGroupName: 'cdk-stateless-1',
      type: 'STATELESS',
      description: 'description',
      ruleGroup: {
        rulesSource: {
          statelessRulesAndCustomActions: {
            statelessRules: [{
              priority: 10,
              ruleDefinition: {
                actions: ['aws:drop'],
                matchAttributes: {
                  destinations: [{
                    addressDefinition: '0.0.0.0/0',
                  }],
                  sources: [{
                    addressDefinition: '192.0.2.0/24',
                  }],
                },
              },
            }]
          }
        }

      }
    });
    const statefulRuleGroup1 = new networkfirewall.CfnRuleGroup(this, 'statefulRuleGroup1', {
      capacity: 10,
      ruleGroupName: 'cdk-stateful-block-google',
      type: 'STATEFUL',
      description: 'description',
      ruleGroup: {
        rulesSource: {
          rulesSourceList: {
            generatedRulesType: 'DENYLIST',
            targets: ['.google.com'],
            targetTypes: ['HTTP_HOST', 'TLS_SNI']
          }
        }
      }
    });

    // Network Firewall - Firewall Policy
    const cfnFirewallPolicy = new networkfirewall.CfnFirewallPolicy(this, 'CDKFirewallPolicy', {
      firewallPolicy: {
        statelessDefaultActions: ['aws:forward_to_sfe'],
        statelessFragmentDefaultActions: ['aws:forward_to_sfe'],
        statefulEngineOptions: {
          ruleOrder: 'DEFAULT_ACTION_ORDER'
        },
        statefulRuleGroupReferences: [{
          resourceArn: statefulRuleGroup1.attrRuleGroupArn
        }],
        statelessRuleGroupReferences: [{
          resourceArn: statelessRuleGroup1.attrRuleGroupArn,
          priority: 1
        }],
      },
      firewallPolicyName: 'FW-policy-cdk-1',
      description: 'CDK Firewall Policy to block Google domain'
    });

    // Network Firewall - Firewall Endpoint
    const cfnFirewall = new networkfirewall.CfnFirewall(this, 'CDKFirewallEndpoint', {
      firewallName: 'cdk-firewall-endpoint',
      firewallPolicyArn: cfnFirewallPolicy.attrFirewallPolicyArn,
      subnetMappings: [{
        subnetId: networkFirewallSubnet.subnetId,
      }],
      vpcId: vpc.vpcId,

      description: 'firewall endpoint from cdk'
    });

    const networkfirewallEndpointID = cdk.Fn.select(
      1,
      cdk.Fn.split(
        ':',
        cdk.Fn.select(
          0,
          cfnFirewall.attrEndpointIds
        )
      )
    )

    // Routings
    const NetworkFWSubnetToInternetRoute = new ec2.CfnRoute(
      this,
      'NetworkFWSubnetToInternetRoute',
      {
        routeTableId: NetworkFWSubnetRouteTable.attrRouteTableId,
        destinationCidrBlock: '0.0.0.0/0',
        gatewayId: vpc.internetGatewayId
      });

    const IGWToNetworkFWEndpointRoute = new ec2.CfnRoute(
      this,
      'IGWToNetworkFWEndpointRoute',
      {
        routeTableId: IGWRouteTable.attrRouteTableId,
        destinationCidrBlock: customerSubnet.ipv4CidrBlock,
        vpcEndpointId: networkfirewallEndpointID
      });

    const CustomerSubnetToNetworkFWEndpointRoute = new ec2.CfnRoute(
      this,
      'CustomerSubnetToNetworkFWEndpointRoute',
      {
        routeTableId: CustomerSubnetRouteTable.attrRouteTableId,
        destinationCidrBlock: '0.0.0.0/0',
        vpcEndpointId: networkfirewallEndpointID
      });

    // Route Table Associations
    const cfnNetworkFWSubnetRouteTable = new ec2.CfnSubnetRouteTableAssociation(
      this,
      'cfnNetworkFWSubnetRouteTable',
      {
        routeTableId: NetworkFWSubnetRouteTable.attrRouteTableId,
        subnetId: networkFirewallSubnet.subnetId,
      });

    const cfnCustomerSubnetRouteTable = new ec2.CfnSubnetRouteTableAssociation(
      this,
      'cfnCustomerSubnetRouteTable',
      {
        routeTableId: CustomerSubnetRouteTable.attrRouteTableId,
        subnetId: customerSubnet.subnetId,
      });

    const cfnInternetGWRouteTable = new ec2.CfnGatewayRouteTableAssociation(
      this,
      'cfnInternetGWRouteTable',
      {
        routeTableId: IGWRouteTable.attrRouteTableId,
        // force presence for vpc.internetGatewayId using `!` to
        // avoid assignment type mismatch Typescript error
        gatewayId: vpc.internetGatewayId!,
      });

  }
}

const app = new cdk.App();

new SampleNetworkFirewall(app, 'SampleNetworkFirewall', {
    description: 'Sample Network Firewall Stack',
    synthesizer: new cdk.DefaultStackSynthesizer({
      generateBootstrapVersionRule: false
    }),
    tags: {
      project: 'cdk-anfw'
    },
});





