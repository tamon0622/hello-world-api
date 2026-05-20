import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// レスポンスのヘルパー関数 — 将来エンドポイントが増えても使い回せる
function buildResponse(statusCode: number, body: object): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      // CORS対応（将来フロントエンドから呼ぶときに必要）
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(body),
  };
}

// Lambda ハンドラー本体
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  return buildResponse(200, { message: 'Hello World' });
};
