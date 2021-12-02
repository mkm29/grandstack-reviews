import { typeDefs } from './graphql-schema'
import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import neo4j from 'neo4j-driver'
import { Neo4jGraphQL } from '@neo4j/graphql'
import dotenv from 'dotenv'
import config from './config'

// dotenv.config()

const app = express()

/*
 * Create a Neo4j driver instance to connect to the database
 * using credentials specified as environment variables
 * with fallback to defaults
 */
const driver = neo4j.driver(
  config.NEO4J_URI || process.env.NEO4J_URI,
  neo4j.auth.basic(
    config.NEO4J_USER || process.env.NEO4J_USER,
    config.NEO4J_PASSWORD || process.env.NEO4J_PASSWORD
  )
)

/*
 * Create an executable GraphQL schema object from GraphQL type definitions
 * including autogenerated queries and mutations.
 * Read more in the docs:
 * https://neo4j.com/docs/graphql-manual/current/
 */

const neoSchema = new Neo4jGraphQL({ typeDefs, driver })

/*
 * Create a new ApolloServer instance, serving the GraphQL schema
 * created using makeAugmentedSchema above and injecting the Neo4j driver
 * instance into the context object so it is available in the
 * generated resolvers to connect to the database.
 */
const server = new ApolloServer({
  context: {
    driver,
    driverConfig: { database: config.NEO4J_DATABASE || 'neo4j' },
  },
  schema: neoSchema.schema,
  introspection: true,
  playground: true,
})

// Specify host, port and path for GraphQL endpoint
const port = config.GRAPHQL_SERVER_PORT || process.env.GRAPHQL_SERVER_PORT
const path = config.GRAPHQL_SERVER_PATH || process.env.GRAPHQL_SERVER_PATH
const host = config.GRAPHQL_SERVER_HOST || process.env.GRAPHQL_SERVER_HOST

/*
 * Optionally, apply Express middleware for authentication, etc
 * This also also allows us to specify a path for the GraphQL endpoint
 */
server.applyMiddleware({ app, path })

app.listen({ host, port, path }, () => {
  console.log(`GraphQL server ready at http://${host}:${port}${path}`)
})
