import {Duration} from "aws-cdk-lib";
import {IKey} from "aws-cdk-lib/aws-kms";
import {Queue, QueueEncryption} from "aws-cdk-lib/aws-sqs";
import {Construct} from "constructs";
import {QueueProps} from "../types/queue-props";

export default class QueueConstruct extends Construct {
    private readonly _reCheckQueue: Queue;
    private readonly _startExportQueue: Queue;

    constructor(scope: Construct, id: string, props: QueueProps) {
        super(scope, id);


        this._reCheckQueue = new Queue(
            this,
            `Recheck-Queue`,
            {
                queueName: `recheck-queue`,
                encryption: QueueEncryption.KMS,
                encryptionMasterKey: props.key,
                // visibilityTimeout: Duration.seconds(15)
            },
        );

        this._startExportQueue = new Queue(
            this,
            `StartExport-Queue`,
            {
                queueName: `start-export-queue`,
                encryption: QueueEncryption.KMS,
                encryptionMasterKey: props.key,
                visibilityTimeout: Duration.seconds(90)
            },
        );
    }

    get reCheckQueue(): Queue {
        return this._reCheckQueue;
    }

    get startExportQueue(): Queue {
        return this._startExportQueue;
    }
}
