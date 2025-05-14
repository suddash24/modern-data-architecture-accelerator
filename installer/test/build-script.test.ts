import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('Build Script Tests', () => {
  const testScriptDir = path.join(__dirname, 'temp');

  beforeAll(() => {
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(testScriptDir)) {
      fs.mkdirSync(testScriptDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up temp directory
    if (fs.existsSync(testScriptDir)) {
      fs.rmSync(testScriptDir, { recursive: true, force: true });
    }
  });

  test('GenAI platform script handles valid inputs correctly', () => {
    const scriptPath = path.join(testScriptDir, 'test_valid.sh');

    // Create test script with valid inputs
    fs.writeFileSync(
      scriptPath,
      `
      #!/bin/bash
      set -e
      
      SAMPLE_NAME="basic_gaia"
      APP_SUBNETS="subnet-123,subnet-456"
      DATA_SUBNETS="subnet-789,subnet-012"
      APP_SECURITY_GROUP_ID="sg-123"
      DATA_SECURITY_GROUP_ID="sg-456"
      VPC_ID="vpc-123"
      
      # Debug information
      echo "APP_SUBNETS: $APP_SUBNETS"
      echo "DATA_SUBNETS: $DATA_SUBNETS"
      
      # Check if APP_SUBNETS and DATA_SUBNETS are set
      if [ -z "$APP_SUBNETS" ] || [ -z "$DATA_SUBNETS" ]; then
        echo "Error: APP_SUBNETS and DATA_SUBNETS must be provided for GenAI platform"
        exit 1
      fi
      
      # Extract app subnets safely
      APP_SUBNET_ARRAY=()
      if [ ! -z "$APP_SUBNETS" ]; then
        IFS="," read -ra APP_SUBNET_ARRAY <<< "$APP_SUBNETS" || true
      fi
      echo "Number of app subnets: \${#APP_SUBNET_ARRAY[@]}"
      if [ \${#APP_SUBNET_ARRAY[@]} -lt 2 ]; then
        echo "Error: At least 2 app subnets are required for GenAI platform"
        exit 1
      fi
      
      # Extract data subnets safely
      DATA_SUBNET_ARRAY=()
      if [ ! -z "$DATA_SUBNETS" ]; then
        IFS="," read -ra DATA_SUBNET_ARRAY <<< "$DATA_SUBNETS" || true
      fi
      echo "Number of data subnets: \${#DATA_SUBNET_ARRAY[@]}"
      if [ \${#DATA_SUBNET_ARRAY[@]} -lt 2 ]; then
        echo "Error: At least 2 data subnets are required for GenAI platform"
        exit 1
      fi
      
      echo "SUCCESS"
    `,
    );

    // Make script executable
    fs.chmodSync(scriptPath, '755');

    // Execute script and check output
    const output = execSync(scriptPath).toString();
    expect(output).toContain('SUCCESS');
  });

  test('GenAI platform script handles insufficient app subnets correctly', () => {
    const scriptPath = path.join(testScriptDir, 'test_invalid_app.sh');

    // Create test script with invalid inputs (only one app subnet)
    fs.writeFileSync(
      scriptPath,
      `
      #!/bin/bash
      set -e
      
      SAMPLE_NAME="basic_gaia"
      APP_SUBNETS="subnet-123"
      DATA_SUBNETS="subnet-789,subnet-012"
      APP_SECURITY_GROUP_ID="sg-123"
      DATA_SECURITY_GROUP_ID="sg-456"
      VPC_ID="vpc-123"
      
      # Debug information
      echo "APP_SUBNETS: $APP_SUBNETS"
      echo "DATA_SUBNETS: $DATA_SUBNETS"
      
      # Check if APP_SUBNETS and DATA_SUBNETS are set
      if [ -z "$APP_SUBNETS" ] || [ -z "$DATA_SUBNETS" ]; then
        echo "Error: APP_SUBNETS and DATA_SUBNETS must be provided for GenAI platform"
        exit 1
      fi
      
      # Extract app subnets safely
      APP_SUBNET_ARRAY=()
      if [ ! -z "$APP_SUBNETS" ]; then
        IFS="," read -ra APP_SUBNET_ARRAY <<< "$APP_SUBNETS" || true
      fi
      echo "Number of app subnets: \${#APP_SUBNET_ARRAY[@]}"
      if [ \${#APP_SUBNET_ARRAY[@]} -lt 2 ]; then
        echo "Error: At least 2 app subnets are required for GenAI platform"
        exit 1
      fi
      
      echo "SUCCESS"
    `,
    );

    // Make script executable
    fs.chmodSync(scriptPath, '755');

    // Execute script and expect it to fail
    try {
      execSync(scriptPath);
      fail('Script should have failed but did not');
    } catch (error: any) {
      expect(error.status).toBe(1);
      expect(error.stdout.toString()).toContain('At least 2 app subnets are required');
    }
  });

  test('GenAI platform script handles insufficient data subnets correctly', () => {
    const scriptPath = path.join(testScriptDir, 'test_invalid_data.sh');

    // Create test script with invalid inputs (only one data subnet)
    fs.writeFileSync(
      scriptPath,
      `
      #!/bin/bash
      set -e
      
      SAMPLE_NAME="basic_gaia"
      APP_SUBNETS="subnet-123,subnet-456"
      DATA_SUBNETS="subnet-789"
      APP_SECURITY_GROUP_ID="sg-123"
      DATA_SECURITY_GROUP_ID="sg-456"
      VPC_ID="vpc-123"
      
      # Debug information
      echo "APP_SUBNETS: $APP_SUBNETS"
      echo "DATA_SUBNETS: $DATA_SUBNETS"
      
      # Check if APP_SUBNETS and DATA_SUBNETS are set
      if [ -z "$APP_SUBNETS" ] || [ -z "$DATA_SUBNETS" ]; then
        echo "Error: APP_SUBNETS and DATA_SUBNETS must be provided for GenAI platform"
        exit 1
      fi
      
      # Extract app subnets safely
      APP_SUBNET_ARRAY=()
      if [ ! -z "$APP_SUBNETS" ]; then
        IFS="," read -ra APP_SUBNET_ARRAY <<< "$APP_SUBNETS" || true
      fi
      echo "Number of app subnets: \${#APP_SUBNET_ARRAY[@]}"
      if [ \${#APP_SUBNET_ARRAY[@]} -lt 2 ]; then
        echo "Error: At least 2 app subnets are required for GenAI platform"
        exit 1
      fi
      
      # Extract data subnets safely
      DATA_SUBNET_ARRAY=()
      if [ ! -z "$DATA_SUBNETS" ]; then
        IFS="," read -ra DATA_SUBNET_ARRAY <<< "$DATA_SUBNETS" || true
      fi
      echo "Number of data subnets: \${#DATA_SUBNET_ARRAY[@]}"
      if [ \${#DATA_SUBNET_ARRAY[@]} -lt 2 ]; then
        echo "Error: At least 2 data subnets are required for GenAI platform"
        exit 1
      fi
      
      echo "SUCCESS"
    `,
    );

    // Make script executable
    fs.chmodSync(scriptPath, '755');

    // Execute script and expect it to fail
    try {
      execSync(scriptPath);
      fail('Script should have failed but did not');
    } catch (error: any) {
      expect(error.status).toBe(1);
      expect(error.stdout.toString()).toContain('At least 2 data subnets are required');
    }
  });

  test('GenAI platform script handles missing subnets correctly', () => {
    const scriptPath = path.join(testScriptDir, 'test_missing.sh');

    // Create test script with missing inputs
    fs.writeFileSync(
      scriptPath,
      `
      #!/bin/bash
      set -e
      
      SAMPLE_NAME="basic_gaia"
      APP_SUBNETS=""
      DATA_SUBNETS="subnet-789,subnet-012"
      APP_SECURITY_GROUP_ID="sg-123"
      DATA_SECURITY_GROUP_ID="sg-456"
      VPC_ID="vpc-123"
      
      # Debug information
      echo "APP_SUBNETS: $APP_SUBNETS"
      echo "DATA_SUBNETS: $DATA_SUBNETS"
      
      # Check if APP_SUBNETS and DATA_SUBNETS are set
      if [ -z "$APP_SUBNETS" ] || [ -z "$DATA_SUBNETS" ]; then
        echo "Error: APP_SUBNETS and DATA_SUBNETS must be provided for GenAI platform"
        exit 1
      fi
      
      echo "SUCCESS"
    `,
    );

    // Make script executable
    fs.chmodSync(scriptPath, '755');

    // Execute script and expect it to fail
    try {
      execSync(scriptPath);
      fail('Script should have failed but did not');
    } catch (error: any) {
      expect(error.status).toBe(1);
      expect(error.stdout.toString()).toContain('APP_SUBNETS and DATA_SUBNETS must be provided');
    }
  });
});
