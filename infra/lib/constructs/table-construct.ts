import { Construct } from "constructs";
import { Fn, RemovalPolicy } from "aws-cdk-lib";
import { IKey, Key } from "aws-cdk-lib/aws-kms";
import {
  AttributeType,
  BillingMode,
  Table,
  TableEncryption,
} from "aws-cdk-lib/aws-dynamodb";
import {TableProps} from "../types/table-props";

export default class TableConstruct extends Construct {
  private readonly _jobTable: Table;
  private readonly _dataTable: Table;

  constructor(scope: Construct, id: string, props: TableProps) {
    super(scope, id);

    this._dataTable = new Table(this, "TableToExport", {
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: { name: "id", type: AttributeType.STRING },
      pointInTimeRecovery: true,
      tableName: "TableToExport",
      encryption: TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: props.key,
    });

      this._jobTable = new Table(this, "SinceTable", {
          billingMode: BillingMode.PAY_PER_REQUEST,
          removalPolicy: RemovalPolicy.DESTROY,
          partitionKey: { name: "id", type: AttributeType.STRING },
          pointInTimeRecovery: true,
          tableName: "JobExport",
          encryption: TableEncryption.CUSTOMER_MANAGED,
          encryptionKey: props.key,
      });

      /*
              {
                  id: "RUN":,
                  lastRunTime: "<time epoch>",
                  status: "RUNNING|COMPLETED|FAILED|STOPPED"
              },
              {
                  id: "RUN:<time epoch>",
                  status: "COMPLETED|FAILED|STOPPED",
                  s3Configuration: {
                      s3Uri: "<uri>",
                      kmsKeyId: "<kmsKeyId>"
                  }
              }
          */
  }

  get tableToExport(): Table {
    return this._dataTable;
  }

  get jobTable(): Table {
      return this._jobTable;
  }
}
