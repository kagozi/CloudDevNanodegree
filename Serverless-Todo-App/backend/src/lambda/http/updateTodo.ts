import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';
import { updateToDo } from '../../businessLogic/ToDo';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
console.log('Processing Event ', event);

const authorization = event.headers.Authorization;
const [, jwtToken] = authorization.split(' ');

const todoId = event.pathParameters.todoId;
const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);

const toDoItem = await updateToDo(updatedTodo, todoId, jwtToken);

return {
statusCode: 200,
headers: {
'Access-Control-Allow-Origin': '*',
},
body: JSON.stringify({
item: toDoItem,
}),
};
};