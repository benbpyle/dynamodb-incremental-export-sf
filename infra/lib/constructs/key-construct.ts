import {Construct} from "constructs";
import {IKey, Key} from "aws-cdk-lib/aws-kms";
import {RemovalPolicy} from "aws-cdk-lib";

export default class KeyConstruct extends Construct {
    private readonly _key: IKey;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this._key = new Key(scope, 'KMSKey', {
            description: 'Sample Export Key',
            removalPolicy: RemovalPolicy.DESTROY
        })
    }

    get key(): IKey {
        return this._key;
    }
}