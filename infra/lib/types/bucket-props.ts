import {IKey} from "aws-cdk-lib/aws-kms";


export interface BucketProps {
  key: IKey;
}
