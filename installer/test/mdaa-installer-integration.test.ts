import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { MdaaInstallerStack } from '../lib/mdaa-installer-stack';

describe('MDAA Installer Integration Tests', () => {
  test('BuildSpec contains correct GenAI platform script', () => {
    const app = new App();
    const stack = new MdaaInstallerStack(app, 'TestStack', {
      env: { account: '123456789012', region: 'us-east-1' },
    });

    const template = Template.fromStack(stack);

    // Get the CodeBuild project
    const projects = template.findResources('AWS::CodeBuild::Project');
    const project = Object.values(projects)[0];

    // Get the BuildSpec
    const source = project.Properties.Source;
    const buildSpec = source.BuildSpec;

    // Convert to string for easier testing
    const buildSpecStr = JSON.stringify(buildSpec);

    // Check for key script components
    expect(buildSpecStr).toContain('SAMPLE_NAME');
    expect(buildSpecStr).toContain('basic_gaia');
    expect(buildSpecStr).toContain('APP_SUBNET_ARRAY');
    expect(buildSpecStr).toContain('DATA_SUBNET_ARRAY');
    expect(buildSpecStr).toContain('IFS');
    expect(buildSpecStr).toContain('APP_SUBNET_ARRAY[@]');
    expect(buildSpecStr).toContain('${#DATA_SUBNET_ARRAY[@]} -lt 2');

    // Check for error handling
    expect(buildSpecStr).toContain('-z');
    expect(buildSpecStr).toContain('APP_SUBNETS');
    expect(buildSpecStr).toContain('DATA_SUBNETS');
    expect(buildSpecStr).toContain('! -z');

    // Check for debug information
    expect(buildSpecStr).toContain('APP_SUBNETS');
    expect(buildSpecStr).toContain('DATA_SUBNETS');
    expect(buildSpecStr).toContain('Number of app subnets');
    expect(buildSpecStr).toContain('Number of data subnets');
  });

  test('BuildSpec contains correct placeholder replacement commands', () => {
    const app = new App();
    const stack = new MdaaInstallerStack(app, 'TestStack', {
      env: { account: '123456789012', region: 'us-east-1' },
    });

    const template = Template.fromStack(stack);

    // Get the CodeBuild project
    const projects = template.findResources('AWS::CodeBuild::Project');
    const project = Object.values(projects)[0];

    // Get the BuildSpec
    const source = project.Properties.Source;
    const buildSpec = source.BuildSpec;

    // Convert to string for easier testing
    const buildSpecStr = JSON.stringify(buildSpec);

    // Check for placeholder replacement commands
    expect(buildSpecStr).toContain('s/{{VPC_ID}}/');
    expect(buildSpecStr).toContain('s/{{APP_SECURITY_GROUP_ID}}/');
    expect(buildSpecStr).toContain('s/{{DATA_SECURITY_GROUP_ID}}/');
    expect(buildSpecStr).toContain('s/{{APP_SUBNET_1}}/');
    expect(buildSpecStr).toContain('s/{{APP_SUBNET_2}}/');
    expect(buildSpecStr).toContain('s/{{DATA_SUBNET_1}}/');
    expect(buildSpecStr).toContain('s/{{DATA_SUBNET_2}}/');
  });
});
