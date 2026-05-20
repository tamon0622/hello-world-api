# CLAUDE.md — hello-world-api

## 概要

AWS CDK + TypeScript で構築した Hello World API。
API Gateway + Lambda 構成で `GET /hello` が `{"message":"Hello World"}` を返す。

## 構成

```
hello-world-api/
├── .github/workflows/deploy.yml   # GitHub Actions 自動デプロイ
├── app/
│   ├── src/handlers/hello.ts      # Lambda ハンドラー本体
│   ├── package.json               # @types/aws-lambda, typescript
│   └── tsconfig.json
└── infra/
    ├── bin/app.ts                 # CDK エントリーポイント
    ├── lib/hello-world-stack.ts   # API GW + Lambda スタック定義
    ├── cdk.json                   # CDK 設定（app: node dist/bin/app.js）
    ├── package.json               # aws-cdk-lib, constructs, source-map-support
    └── tsconfig.json
```

## AWS 環境

| 項目 | 値 |
|---|---|
| アカウント ID | `453219368070` |
| リージョン | `ap-northeast-1`（東京） |
| CloudFormation スタック | `HelloWorldStack` |
| API エンドポイント | `https://67nwx7e7u2.execute-api.ap-northeast-1.amazonaws.com/prod/hello` |
| GitHub Actions ロール | `arn:aws:iam::453219368070:role/github-actions-hello-world-deploy` |

## ビルド・デプロイコマンド

```bash
# app のビルド
cd app && npm ci && npm run build

# infra のビルド
cd infra && npm ci && npm run build

# ローカルで CloudFormation テンプレート確認（AWS 不要）
cd infra && npx cdk synth

# AWS へデプロイ
cd infra && CDK_DEFAULT_ACCOUNT=453219368070 CDK_DEFAULT_REGION=ap-northeast-1 npx cdk deploy --require-approval never

# 差分確認
cd infra && npx cdk diff
```

## GitHub Actions

- トリガー: `main` ブランチへの push
- 認証: OIDC（アクセスキー不要）
- 必要な Secrets:
  - `AWS_ROLE_ARN`: `arn:aws:iam::453219368070:role/github-actions-hello-world-deploy`
  - `AWS_ACCOUNT_ID`: `453219368070`

## 拡張方法

### API エンドポイントを追加する

1. `app/src/handlers/` に新しいハンドラーを追加
2. `infra/lib/hello-world-stack.ts` でリソースとメソッドを追加

```typescript
// 例: GET /bye を追加
const byeFn = new lambda.Function(this, 'ByeFunction', { ... });
const bye = api.root.addResource('bye');
bye.addMethod('GET', new apigw.LambdaIntegration(byeFn));
```

### DynamoDB を追加する

```typescript
// infra/lib/hello-world-stack.ts に追加
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

const table = new dynamodb.Table(this, 'ItemsTable', {
  partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
});
table.grantReadWriteData(helloFn);
```

### 認証を追加する

```typescript
// Cognito UserPool を API Gateway の Authorizer に設定
import * as cognito from 'aws-cdk-lib/aws-cognito';
```

## 注意事項

- `infra/` 内の `__dirname` はコンパイル後 `infra/dist/lib/` を指すため、
  Lambda コードのパスは `path.join(__dirname, '../../../app/dist')` で3階層上
- CDK bootstrap は ap-northeast-1 に済み（バージョン 14 / CDKToolkit スタック）
- bootstrap バージョン推奨は 21 以上（動作には支障なし）
