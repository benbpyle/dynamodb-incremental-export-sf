import { Construct } from "constructs";
import { ScheduleProps } from "../types/schedule-props";
import { Rule, RuleTargetInput, Schedule } from "aws-cdk-lib/aws-events";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { StateMachine } from "aws-cdk-lib/aws-stepfunctions";
import { SfnStateMachine } from "aws-cdk-lib/aws-events-targets";

export class ScheduleConstruct extends Construct {
  constructor(scope: Construct, id: string, props: ScheduleProps) {
    super(scope, id);

    const rule = new Rule(scope, "ExportRule", {
      description: "Runs the DynamoDB Export Process",
      schedule: Schedule.expression("cron(0/" + 30 + " * * * ? *)"),
    });

    const dlq = new Queue(this, "RuleDeadLetterQueue", {
      queueName: "ddb-trigger-dlq",
    });

    const role = new Role(this, "Role", {
      assumedBy: new ServicePrincipal("events.amazonaws.com"),
    });

    rule.addTarget(
      new SfnStateMachine(props.stateMachine, {
        deadLetterQueue: dlq,
        role: role,
      }),
    );
  }
}
