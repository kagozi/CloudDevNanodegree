import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";
import { parseUserId } from "../auth/utils";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import { TodoAccess } from "../dataLayer/ToDoAccess";
import uuidv4 from "uuid/v4";

const toDoAccess = new TodoAccess();

export const getAllToDo = (jwtToken: string): Promise<TodoItem[]> => {
  const userId = parseUserId(jwtToken);
  return toDoAccess.getAllTodos(userId);
};

export const createToDo = (createTodoRequest: CreateTodoRequest, jwtToken: string): Promise<TodoItem> => {
  const userId = parseUserId(jwtToken);
  const todoId = uuidv4();
  const s3BucketName = process.env.S3_BUCKET_NAME;

  return toDoAccess.createTodo({
    userId,
    todoId,
    attachmentUrl: `https://${s3BucketName}.s3.amazonaws.com/${todoId}`,
    createdAt: new Date().getTime().toString(),
    done: false,
    ...createTodoRequest,
  });
};

export const updateToDo = (updateTodoRequest: UpdateTodoRequest, todoId: string, jwtToken: string): Promise<TodoUpdate> => {
  const userId = parseUserId(jwtToken);
  return toDoAccess.updateTodo(updateTodoRequest, todoId, userId);
};

export const deleteToDo = (todoId: string, jwtToken: string): Promise<string> => {
  const userId = parseUserId(jwtToken);
  return toDoAccess.deleteToDo(todoId, userId);
};

export const generateUploadUrl = (todoId: string): Promise<string> => {
  return toDoAccess.generateUploadUrl(todoId);
};
