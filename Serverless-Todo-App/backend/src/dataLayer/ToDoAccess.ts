import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Types as S3Types } from 'aws-sdk/clients/s3';
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS);
export class TodoAccess {
private readonly docClient: DocumentClient;
private readonly s3Client: S3Types;
private readonly todoTable: string;
private readonly s3BucketName: string;

constructor() {
this.docClient = new XAWS.DynamoDB.DocumentClient();
this.s3Client = new XAWS.S3({ signatureVersion: 'v4' });
this.todoTable = process.env.TODOS_TABLE;
this.s3BucketName = process.env.S3_BUCKET_NAME;
}

async getAllTodos(userId: string): Promise<TodoItem[]> {
    console.log('Getting all todos');
const params = {
  TableName: this.todoTable,
  KeyConditionExpression: '#userId = :userId',
  ExpressionAttributeNames: {
    '#userId': 'userId',
  },
  ExpressionAttributeValues: {
    ':userId': userId,
  },
};

const result = await this.docClient.query(params).promise();
console.log(result);
const items = result.Items;

return items as TodoItem[];
}

async createTodo(todo: TodoItem): Promise<TodoItem> {
    console.log('Creating new todo');
const params = {
  TableName: this.todoTable,
  Item: todo,
};

const result = await this.docClient.put(params).promise();
console.log(result);

return todo as TodoItem;
}

async updateTodo(todoUpdate: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {
    console.log('Updating todo');
const params = {
  TableName: this.todoTable,
  Key: {
    userId,
    todoId,
  },
  UpdateExpression: 'set #name = :name, #dueDate = :dueDate, #done = :done',
  ExpressionAttributeNames: {
    '#name': 'name',
    '#dueDate': 'dueDate',
    '#done': 'done',
  },
  ExpressionAttributeValues: {
    ':name': todoUpdate.name,
    ':dueDate': todoUpdate.dueDate,
    ':done': todoUpdate.done,
  },
  ReturnValues: 'ALL_NEW',
};

const result = await this.docClient.update(params).promise();
console.log(result);
const attributes = result.Attributes;

return attributes as TodoUpdate;
}

  async deleteToDo(todoId: string, userId: string): Promise<string> {
        console.log("Deleting todo");

        const params = {
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
        };

        const result = await this.docClient.delete(params).promise();
        console.log(result);

        return "" as string;
    }

    async generateUploadUrl(todoId: string): Promise<string> {
        console.log("Generating URL");

        const url = this.s3Client.getSignedUrl('putObject', {
            Bucket: this.s3BucketName,
            Key: todoId,
            Expires: 1000,
        });
        console.log(url);

        return url as string;
    }
}