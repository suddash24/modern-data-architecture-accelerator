/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { MdaaNagSuppressions } from '@aws-mdaa/construct';
import { SystemConfig } from './types';
import { IMdaaResourceNaming } from '@aws-mdaa/naming';

export interface VpcEndpointsProps {
  readonly config: SystemConfig;
  readonly vpc: ec2.IVpc;
  readonly securityGroups: ec2.ISecurityGroup[];
  readonly subnets: ec2.ISubnet[];
  readonly naming: IMdaaResourceNaming;
}

/**
 * Creates VPC endpoints required for GAIA to function in private subnets
 */
export class VpcEndpoints extends Construct {
  readonly secretsManagerEndpoint: ec2.IInterfaceVpcEndpoint;

  constructor(scope: Construct, id: string, props: VpcEndpointsProps) {
    super(scope, id);

    // Create VPC Endpoint for Secrets Manager
    const secretsManagerEndpoint = new ec2.InterfaceVpcEndpoint(this, 'SecretsManagerEndpoint', {
      vpc: props.vpc,
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      subnets: { subnets: props.subnets },
      securityGroups: props.securityGroups,
      privateDnsEnabled: true,
    });

    // Add NAG suppressions for the VPC endpoint
    MdaaNagSuppressions.addCodeResourceSuppressions(
      secretsManagerEndpoint,
      [
        {
          id: 'AwsSolutions-EC23',
          reason: 'VPC Endpoint is secured with security groups and private DNS is enabled',
        },
      ],
      true,
    );

    this.secretsManagerEndpoint = secretsManagerEndpoint;
  }
}
