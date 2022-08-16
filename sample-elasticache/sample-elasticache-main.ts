#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SampleElasticacheStack } from '../lib/sample-elasticache-stack';

const app = new cdk.App();
new SampleElasticacheStack(app, 'SampleElasticacheStack', {

    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT, 
        region: process.env.CDK_DEFAULT_REGION 
      },

});
