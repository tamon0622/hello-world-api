import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import { Construct } from 'constructs';

export class HelloWorldStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // --- Lambda ---
    // app/dist/handlers/hello.js をデプロイパッケージとして使用
    const helloFn = new lambda.Function(this, 'HelloFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handlers/hello.handler', // ファイルパス.関数名
      // __dirname はコンパイル後 infra/dist/lib/ を指すため 3階層上がプロジェクトルート
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../app/dist')),
      description: 'GET /hello — Hello World を返す Lambda',
      timeout: cdk.Duration.seconds(10),
    });

    // --- API Gateway ---
    const api = new apigw.RestApi(this, 'HelloWorldApi', {
      restApiName: 'hello-world-api',
      description: 'Hello World REST API',
      // デプロイのたびにステージ名が変わらないよう固定
      deployOptions: {
        stageName: 'prod',
      },
    });

    // GET /hello → Lambda 統合
    const hello = api.root.addResource('hello');
    hello.addMethod('GET', new apigw.LambdaIntegration(helloFn));

    // デプロイ後に URL を出力
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: `${api.url}hello`,
      description: 'API エンドポイント URL',
    });
  }
}
