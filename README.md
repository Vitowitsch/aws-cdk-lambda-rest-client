# Module Description

AWS lambda function implementing a REST client. The infrastructue code (AWS Stack and AWS Code Commit Pipeline mangaged with AWS CDK.)

Both Buiness rules and CDK infrastructure code written in Typescript.

With git-pre-commit hooks for linting and formatting.


## Initial Deployment
* Manual deployment was performed once to install the Code Pipeline: `cdk deploy RestClientPipelineStack`
* Changes can now be applied again manually or by merging the change to the main branch. 
  This will automatically trigger the pipeline for the new deployment.


## Local testing
- docker installed (need to cdk synth NodejsFunction, if you want to test it locally)
- `pip install aws-sam-cli` (as elevated user)
- `cdk synth`
- `sam local invoke RestClientLambda -t cdk.out/RestClientStack.template.json`
  - Note that this is not a simulation, but uses real AWS ressources.
