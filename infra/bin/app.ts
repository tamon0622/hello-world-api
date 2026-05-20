#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { HelloWorldStack } from '../lib/hello-world-stack';

const app = new cdk.App();

// スタックを生成 — 将来スタックが増えてもここで追加するだけ
new HelloWorldStack(app, 'HelloWorldStack', {
  env: {
    // GitHub Actions の環境変数から取得（未設定なら CDK が自動判定）
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'ap-northeast-1',
  },
  description: 'Hello World API — API Gateway + Lambda',
});
