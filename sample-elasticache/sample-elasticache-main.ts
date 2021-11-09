#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SampleElasticacheStack } from '../lib/sample-elasticache-stack';

const app = new cdk.App();
new SampleElasticacheStack(app, 'SampleElasticacheStack', {

  env: { account: '860873776111', region: 'ap-southeast-1' },

});
