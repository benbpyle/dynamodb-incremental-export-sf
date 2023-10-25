import { Table } from "aws-cdk-lib/aws-dynamodb";
import { IKey } from "aws-cdk-lib/aws-kms";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { IFunction } from "aws-cdk-lib/aws-lambda";

export interface StateMachineConstructProps {
  exportTable: Table;
  jobTable: Table;
  key: IKey;
  startExportQueue: Queue;
  bucket: Bucket;
//  prepChangeFunction: IFunction;
}
