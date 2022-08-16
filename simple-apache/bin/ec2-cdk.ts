#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EC2ApacheWebServer } from '../lib/ec2-cdk-stack';

const app = new cdk.App();

new EC2ApacheWebServer(app, 'EC2ApacheWebServer', {
// new EC2ApacheWebServer(app, 'halo-bandung', {
    /* If you don't specify 'env', this stack will be environment-agnostic.
    * Account/Region-dependent features and context lookups will not work,
    * but a single synthesized template can be deployed anywhere. */
   
   /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  
  /* Uncomment the next line if you know exactly what Account and Region you
  * want to deploy the stack to. */
  description: 'This is Apache Web Server'
  ,env: { account: '860873776111', region: 'ap-southeast-1' }
  ,tags: {
    project: 'EC2ApacheWebServer',
    environment: 'test'
  }

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});