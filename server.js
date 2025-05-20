const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const typeDefs = require("./schema/typeDefs");
const resolvers = require("./schema/resolvers");
const { basicAuth } = require("./middlewares/auth");
require("dotenv").config();
require("./db"); // initialises connection

// สร้าง schema object
const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();

// Basic-Auth เฉพาะเส้น /graphql
app.use("/graphql", basicAuth);

app.use(
  "/graphql",
  graphqlHTTP({
    schema
  }),
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 GraphQL Server running at http://localhost:${PORT}/graphql`),
);
