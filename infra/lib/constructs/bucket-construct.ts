import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
} from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { BucketProps } from "../types/bucket-props";
import {randomUUID} from "crypto";

export default class BucketConstruct extends Construct {
  private readonly _bucket: Bucket;

  get bucket(): Bucket {
    return this._bucket;
  }

  constructor(scope: Construct, id: string, props: BucketProps) {
    super(scope, id);

    this._bucket = new Bucket(scope, "ExportBucket", {
      encryption: BucketEncryption.KMS,
      encryptionKey: props.key,
      bucketName: `ddb-incremental-export-example`,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });
  }
}
