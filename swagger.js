import swaggerAutogen from "swagger-autogen";

const swagger = swaggerAutogen();

const doc = {
  info: {
    title: "Expense Tracker",
    description: "Expense Tracker API documentation",
  },
};

const outputFile = "./swagger.json";

const routes = ["./server.js"];

swagger(outputFile, routes, doc);
