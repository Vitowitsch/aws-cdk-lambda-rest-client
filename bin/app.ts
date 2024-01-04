import * as cdk from "aws-cdk-lib";
import { RestClientPipelineStack } from "../lib/RestClientPipelineStack";
import { RestClientStack } from "../lib/RestClientStack";
import { getStackModifier } from "../lib/Env";

const app = new cdk.App();
new RestClientStack(app, `${getStackModifier(app)}RestClientStack`, {
  stackName: `${getStackModifier(app)}RestClientStack`,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
const myPipelineStack = new RestClientPipelineStack(
  app,
  `RestClientPipelineStack`,
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
  },
);

app.synth();
