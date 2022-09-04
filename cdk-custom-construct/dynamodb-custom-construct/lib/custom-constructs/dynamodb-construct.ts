import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';

// set standard property for DynamoDB
type DynamodbTableProps = {
  removalPolicy?: cdk.RemovalPolicy;
  partitionKey: dynamodb.Attribute;
  sortKey?: dynamodb.Attribute | undefined;
}

// Custom Construct
export class DynamoDBTableConstruct extends Construct {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: DynamodbTableProps) {
    super(scope, id);

    const {removalPolicy, partitionKey, sortKey} = props;

    this.table = new dynamodb.Table(this, id, {
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
      partitionKey: partitionKey,
      sortKey: sortKey,
      removalPolicy: removalPolicy ?? cdk.RemovalPolicy.DESTROY
    })
  }
}