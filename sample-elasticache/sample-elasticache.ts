import * as cdk from '@aws-cdk/core';
import * as elasticache from '@aws-cdk/aws-elasticache';
import * as ec2 from '@aws-cdk/aws-ec2';
import { CfnCacheCluster } from '@aws-cdk/aws-elasticache';

export class SampleElasticacheStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
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
        ec2.Port.tcp(11511),
        'Allows Port 11511 access from Internet'
      )

    // The code that defines your stack goes here
    new CfnCacheCluster(this, 'CDK-Elasticache', {
        cacheNodeType: 'cache.t3.micro',
        engine: 'memcached',
        numCacheNodes: 1,
        clusterName: 'cdk-memcached',
        vpcSecurityGroupIds: [securityGroup.securityGroupId]
    })
    
  }
}
