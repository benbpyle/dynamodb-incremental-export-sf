import {Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import KeyConstruct from "./constructs/key-construct";
import BucketConstruct from "./constructs/bucket-construct";
import TableConstruct from "./constructs/table-construct";
import QueueConstruct from "./constructs/queue-construct";
import ExportStateMachineConstruct from "./constructs/export-state-machine-construct";
import {ScheduleConstruct} from "./constructs/schedule-construct";

export default class AppStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const version = new Date().toISOString();
        const keyConstruct = new KeyConstruct(this, 'KeyConstruct');
        const bucketConstruct = new BucketConstruct(this, 'BucketConstruct', {
            key: keyConstruct.key
        });

        const tableConstruct = new TableConstruct(this, 'TableConstruct', {
            key: keyConstruct.key
        })

        const queueConstruct = new QueueConstruct(this, 'QueueConstruct', {
            key: keyConstruct.key
        })

        const stateMachineConstruct = new ExportStateMachineConstruct(
            this, 'StateMachineConstruct', {
                key: keyConstruct.key,
                startExportQueue: queueConstruct.startExportQueue,
                bucket: bucketConstruct.bucket,
                exportTable: tableConstruct.tableToExport,
                jobTable: tableConstruct.jobTable
            }
        )

        const scheduleConstruct = new ScheduleConstruct(this, 'ScheduleConstruct', {
            stateMachine: stateMachineConstruct.sf
        })

    }
}