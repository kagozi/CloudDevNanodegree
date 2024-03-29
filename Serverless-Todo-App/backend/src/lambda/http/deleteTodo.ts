import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { deleteToDo } from '../../businessLogic/ToDo';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing Event:', event);

  const authorization = event.headers.Authorization;
  const [, jwtToken] = authorization.split(' ');
  const todoId = event.pathParameters.todoId;

  const deleteData = await deleteToDo(todoId, jwtToken);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: deleteData,
  };
};
