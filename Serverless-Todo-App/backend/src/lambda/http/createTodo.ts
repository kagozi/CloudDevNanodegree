import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { createToDo } from '../../businessLogic/ToDo';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing Event:', event);

  const authorization = event.headers.Authorization;
  const [, jwtToken] = authorization.split(' ');
  const newTodo: CreateTodoRequest = JSON.parse(event.body);
  const toDoItem = await createToDo(newTodo, jwtToken);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      item: toDoItem,
    }),
  };
};
