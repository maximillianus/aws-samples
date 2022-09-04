import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { DynamoDBTableConstruct } from './custom-constructs/dynamodb-construct'

export class DynamoDBCustomConstructStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const {table: todosTable} = new DynamoDBTableConstruct(
      this,
      'todos-table',
      {
        partitionKey: {name: 'date', type: dynamodb.AttributeType.STRING},
        sortKey: {name: 'createdAt', type: dynamodb.AttributeType.NUMBER}
      }
    );
  }
}
