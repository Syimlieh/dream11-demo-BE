const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Fantasy Cricket App",
    description: "Application Similar to Dream 11",
  },
  host: "localhost:3000",
};

const outputFile = "./swagger_output.json";
const routes = ["./routes"];

swaggerAutogen(outputFile, routes, doc).then(() => {
  require("./index.js");
});
