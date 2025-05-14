import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { MdaaInstallerStack } from '../lib/mdaa-installer-stack';

describe('MDAA Installer Stack', () => {
  let app: App;
  let stack: MdaaInstallerStack;
  let template: Template;

  beforeEach(() => {
    app = new App();
    stack = new MdaaInstallerStack(app, 'TestStack', {
      env: { account: '123456789012', region: 'us-east-1' },
    });
    template = Template.fromStack(stack);
  });

  test('Creates GitHub and S3 pipelines', () => {
    // Verify GitHub pipeline is created
    template.resourceCountIs('AWS::CodePipeline::Pipeline', 2);

    // Check for GitHub pipeline name
    const resources = template.findResources('AWS::CodePipeline::Pipeline');
    const pipelineNames = Object.values(resources).map((resource: any) => resource.Properties.Name);

    expect(pipelineNames).toContain('MDAA-GitHubPipeline');
    expect(pipelineNames).toContain('MDAA-S3Pipeline');
  });

  test('Has correct parameters for samples', () => {
    // Verify SampleName parameter has the correct allowed values
    const parameters = template.findParameters('*', {
      Type: 'String',
    });

    const sampleNameParam = Object.values(parameters).find(
      (param: any) => param.Description === 'MDAA Sample you want to deploy',
    );

    expect(sampleNameParam).toBeDefined();
    if (sampleNameParam) {
      expect(sampleNameParam.AllowedValues).toContain('basic_datalake');
      expect(sampleNameParam.AllowedValues).toContain('basic_datascience_platform');
      expect(sampleNameParam.AllowedValues).toContain('basic_gaia');
    }

    // Verify network parameters exist
    template.hasParameter('VpcId', {});
    template.hasParameter('SubnetId', {});
    template.hasParameter('AppSecurityGroupId', {});
    template.hasParameter('AppSubnets', {});
    template.hasParameter('DataSecurityGroupId', {});
    template.hasParameter('DataSubnets', {});
  });

  test('Has rules in the template', () => {
    // Get the template as JSON to check for rules
    const templateJson = template.toJSON();

    // Check that we have rules
    expect(templateJson.Rules).toBeDefined();

    // Check for specific rule names
    if (templateJson.Rules) {
      expect(templateJson.Rules.ValidateOrganizationName).toBeDefined();

      // Just check that we have multiple rules
      const ruleCount = Object.keys(templateJson.Rules).length;
      expect(ruleCount).toBeGreaterThan(1);
    }
  });

  test('CodeBuild project has correct environment variables', () => {
    // Get the CodeBuild project
    const projects = template.findResources('AWS::CodeBuild::Project');
    expect(Object.keys(projects).length).toBeGreaterThan(0);

    // Get the first project
    const project = Object.values(projects)[0];

    // Check environment variables
    const envVars = project.Properties.Environment.EnvironmentVariables;
    const envVarNames = envVars.map((env: any) => env.Name);

    expect(envVarNames).toContain('VPC_ID');
    expect(envVarNames).toContain('APP_SECURITY_GROUP_ID');
    expect(envVarNames).toContain('APP_SUBNETS');
    expect(envVarNames).toContain('DATA_SECURITY_GROUP_ID');
    expect(envVarNames).toContain('DATA_SUBNETS');
  });

  test('BuildSpec has correct commands for GenAI platform', () => {
    // Get the CodeBuild project
    const projects = template.findResources('AWS::CodeBuild::Project');
    const project = Object.values(projects)[0];

    // Get the BuildSpec
    const source = project.Properties.Source;
    const buildSpec = source.BuildSpec;

    // Convert to string for easier testing
    const buildSpecStr = JSON.stringify(buildSpec);

    // Check for key commands
    expect(buildSpecStr).toContain('SAMPLE_NAME');
    expect(buildSpecStr).toContain('ORG_NAME');
    expect(buildSpecStr).toContain('VPC_ID');
    expect(buildSpecStr).toContain('SUBNET_ID');
    expect(buildSpecStr).toContain('APP_SECURITY_GROUP_ID');
    expect(buildSpecStr).toContain('APP_SUBNETS');
    expect(buildSpecStr).toContain('DATA_SECURITY_GROUP_ID');
    expect(buildSpecStr).toContain('DATA_SUBNETS');

    // Check for GenAI platform specific commands
    expect(buildSpecStr).toContain('SAMPLE_NAME');
    expect(buildSpecStr).toContain('basic_gaia');
    expect(buildSpecStr).toContain('APP_SUBNET_ARRAY');
    expect(buildSpecStr).toContain('DATA_SUBNET_ARRAY');
  });
});
