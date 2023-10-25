import {Construct} from "constructs";
import {StateMachineConstructProps} from "../types/state-machine-props";
import {DefinitionBody, LogLevel, StateMachine, StateMachineType,} from "aws-cdk-lib/aws-stepfunctions";
import {LogGroup, RetentionDays} from "aws-cdk-lib/aws-logs";
import {RemovalPolicy} from "aws-cdk-lib";
import * as fs from "fs";
import * as path from "path";
import {Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal,} from "aws-cdk-lib/aws-iam";

export default class ExportStateMachineConstruct extends Construct {
    private readonly _sf: StateMachine;

    get sf(): StateMachine {
        return this._sf;
    }

    constructor(scope: Construct, id: string, props: StateMachineConstructProps) {
        super(scope, id);

        const file = fs.readFileSync(path.resolve(__dirname, "../state-machines/export.json"));

        const logGroup = new LogGroup(this, "CloudwatchLogs", {
            logGroupName: "/aws/vendedlogs/states/ddb-export",
            removalPolicy: RemovalPolicy.DESTROY,
            retention: RetentionDays.ONE_DAY,
        });

        const kmsPolicy = new PolicyDocument({
            statements: [
                new PolicyStatement({
                    actions: [
                        "kms:Decrypt",
                        "kms:DescribeKey",
                        "kms:Encrypt",
                        "kms:GenerateDataKey*",
                        "kms:ReEncrypt*",
                    ],
                    resources: [
                        props.key.keyArn,
                    ],
                    effect: Effect.ALLOW,
                }),
            ],
        });

        const ddbPolicy = new PolicyDocument({
            statements: [
                new PolicyStatement({
                    actions: [
                        "dynamodb:GetItem",
                        "dynamodb:BatchGetItem",
                        "dynamodb:BatchWriteItem",
                        "dynamodb:ConditionCheckItem",
                        "dynamodb:DeleteItem",
                        "dynamodb:DescribeTable",
                        "dynamodb:GetRecords",
                        "dynamodb:GetShardIterator",
                        "dynamodb:PutItem",
                        "dynamodb:Query",
                        "dynamodb:Scan",
                        "dynamodb:UpdateItem",
                    ],
                    resources: [props.jobTable.tableArn],
                    effect: Effect.ALLOW,
                }),
                new PolicyStatement({
                    actions: [
                        "dynamodb:ExportTableToPointInTime"
                    ],
                    resources: [props.exportTable.tableArn],
                    effect: Effect.ALLOW,
                }),
                new PolicyStatement({
                    actions: [
                        "dynamodb:DescribeExport"
                    ],
                    resources: [`${props.exportTable.tableArn}/export/*`],
                    effect: Effect.ALLOW,
                }),

            ],
        });

        const logPolicy = new PolicyDocument({
            statements: [
                new PolicyStatement({
                    actions: [
                        "logs:CreateLogDelivery",
                        "logs:DeleteLogDelivery",
                        "logs:DescribeLogGroups",
                        "logs:DescribeResourcePolicies",
                        "logs:GetLogDelivery",
                        "logs:ListLogDeliveries",
                        "logs:PutResourcePolicy",
                        "logs:UpdateLogDelivery",
                    ],
                    resources: ["*"],
                    effect: Effect.ALLOW,
                }),
            ],
        });

        const s3Policy = new PolicyDocument({
            statements: [
                new PolicyStatement({
                    actions: [
                        "s3:AbortMultipartUpload",
                        "s3:PutObject",
                        "s3:PutObjectAcl"
                    ],
                    resources: [
                        `${props.bucket.bucketArn}/*`,
                        props.bucket.bucketArn
                    ],
                    effect: Effect.ALLOW,
                }),
            ],
        });


        const role = new Role(this, "StateMachineRole", {
            assumedBy: new ServicePrincipal(`states.us-west-2.amazonaws.com`),
            inlinePolicies: {
                cloudwatch: logPolicy,
                ddb: ddbPolicy,
                s3: s3Policy,
                dataAndQueueKey: kmsPolicy,
            },
        });

        this._sf = new StateMachine(this, "ExportStateMachine", {
            definitionBody: DefinitionBody.fromString(file.toString()),
            role: role,
            stateMachineName: "DDBExport",
            stateMachineType: StateMachineType.STANDARD,
            logs: {
                level: LogLevel.ALL,
                destination: logGroup,
                includeExecutionData: true,
            },
            definitionSubstitutions: {
                JobExportTable: props.jobTable.tableName,
                TableToExportArn: props.exportTable.tableArn,
                BucketName: props.bucket.bucketName
            },
        });
    }
}
