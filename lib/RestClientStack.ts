import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { getBaseVpc, getSubnet } from "./VpcCfg";
import { getStackModifier } from "./Env";

export class RestClientStack extends cdk.Stack {
  bucketArn: string;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dbSecretArn = this.getDBSecretArn();
    const dbEndpoint = this.getDBEndpoint();
    const dbSchema = this.getDBSchema();
    const dbSecretName = this.getDBSecretName();
    this.bucketArn = this.getBucketArn();
    const lambdaExecutionRole = this.createLambdaExecutionRole(dbSecretArn);
    const lambdaHandler = this.createNodejsFunction(
      lambdaExecutionRole,
      dbEndpoint,
      dbSchema,
      dbSecretName,
    );

    new cdk.CfnOutput(this, `${getStackModifier(this)}RestClientLambdaArn`, {
      value: lambdaHandler.functionArn,
      exportName: `${getStackModifier(this)}RestClientLambdaArn`,
      description: `${getStackModifier(this)}RestClientLambdaArn`,
    });
  }

  private getDBSecretArn() {
    return cdk.Fn.importValue(
      `${getStackModifier(this)}DBSecretArnOutputMySql`,
    );
  }

  private getBucketName() {
    return cdk.Fn.importValue(`${getStackModifier(this)}RestClientBucketName`);
  }

  private getBucketArn() {
    return cdk.Fn.importValue(`${getStackModifier(this)}RestClientBucketArn`);
  }

  private getKMSKeyArn() {
    return cdk.Fn.importValue(`${getStackModifier(this)}KmsKeyArnRestClient`);
  }

  private getDBEndpoint() {
    return ssm.StringParameter.valueForStringParameter(
      this,
      `/${getStackModifier(this)}DBEndpointMySql`,
    );
  }

  private getDBSchema() {
    return cdk.Fn.importValue(`${getStackModifier(this)}DefaultDb`);
  }

  private getDBSecretName() {
    return cdk.Fn.importValue(
      `${getStackModifier(this)}DBSecretNameOutputMySql`,
    );
  }

  private createLambdaExecutionRole(dbSecretArn: string) {
    const lambdaExecutionRole = new iam.Role(
      this,
      `${getStackModifier(this)}lambdaExecutionRole`,
      {
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      },
    );

    lambdaExecutionRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole",
      ),
    );
    lambdaExecutionRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaVPCAccessExecutionRole",
      ),
    );
    lambdaExecutionRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonRDSFullAccess"),
    );
    lambdaExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["secretsmanager:GetSecretValue"],
        resources: [dbSecretArn],
      }),
    );
    lambdaExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["ssm:GetParameter"],
        resources: [`arn:aws:ssm:${this.region}:${this.account}:parameter/*`],
      }),
    );

    lambdaExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:Encrypt",
          "kms:DescribeKey",
          "kms:Decrypt",
        ],
        resources: [this.getKMSKeyArn()],
      }),
    );

    return lambdaExecutionRole;
  }

  private createRestClientLambda(
    lambdaExecutionRole: iam.Role,
    dbEndpoint: string,
    dbSchema: string,
    dbSecretName: string,
  ): NodejsFunction {
    return new NodejsFunction(
      this,
      `${getStackModifier(this)}RestClientLambda`,
      {
        entry: "src/restClientRcv.ts",
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_18_X,
        memorySize: 8192,
        timeout: cdk.Duration.seconds(900),
        vpc: getBaseVpc(this),
        role: lambdaExecutionRole,
        vpcSubnets: { subnets: getSubnet(this) },

        environment: {
          DB: dbSchema,
          REGION: this.region,
          SECRET_NAME: dbSecretName.toString(),
        },
      },
    );
  }
}
