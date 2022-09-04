import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';

// 👇 Construct we've written
export class UploadsBucketConstruct extends Construct {
  public readonly s3Bucket: s3.Bucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.s3Bucket = new s3.Bucket(this, id);
  }
}

// 👇 Stack Definition
export class CdkConstructsStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const s3Bucket = new UploadsBucketConstruct(this, 'new-s3-bucket');
  }
}

// 👇 App initialization
const app = new cdk.App();

// 👇 Stack instantiation
new CdkConstructsStack(app, `cdk-constructs-stack-dev`, {
  stackName: `cdk-constructs-stack-dev`,
  description: `This is S3 Custom Construct`,
  env: {region: process.env.CDK_DEFAULT_REGION},
  tags: {env: 'dev'},
});
