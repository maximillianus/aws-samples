import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep, CodeBuildStep } from 'aws-cdk-lib/pipelines';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class S3BucketStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Creates an S3 bucket
    const s3Bucket = new s3.Bucket(this, 's3-bucket', {
        bucketName: 'cdk-pipeline-test-s3-bucket'
    });
  }
}