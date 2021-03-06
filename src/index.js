const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "This user doesn't exists" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).send(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).send(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todoAlreadyExist = user.todos.find((e) => e.id === id);

  if (!todoAlreadyExist) {
    return response.status(404).json({ error: "Todo doesn't exists" });
  }

  Object.assign(todoAlreadyExist, {
    title,
    deadline: new Date(deadline),
  });

  return response.json(todoAlreadyExist);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoAlreadyExist = user.todos.find((e) => e.id === id);

  if (!todoAlreadyExist) {
    return response.status(404).json({ error: "Todo doesn't exists" });
  }

  Object.assign(todoAlreadyExist, {
    done: true,
  });

  return response.json(todoAlreadyExist);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoAlreadyExist = user.todos.find((e) => e.id === id);

  if (!todoAlreadyExist) {
    return response.status(404).json({ error: "Todo doesn't exists" });
  }

  user.todos.splice(todoAlreadyExist, 1);

  return response.status(204).send();
});

module.exports = app;
