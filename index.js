const cors = require('cors')
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');

const app = express()

app.use(cors())

let users = {
  1: {
    id: "1",
    username: 'Jon Dain'
  },
  2: {
    id: "2",
    username: 'Kevin Bacon'
  }
}


const schema = gql`
  type Query {
    users: [User!]
    user(id: ID!): User
    me: User
  }

  type User {
    id: ID!
    username: String!
  }
`
const resolvers = {
  Query: {
    users: () => {
      return Object.values(users)
    },
    user: (parent, { id }) => {
      return users[id]
    },
    me: (parent, args, { me }, info) => {
      return me;
    }
  },
}

  const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    context: {
      me: users[1]
    }
  })

server.applyMiddleware({ app, path: '/graphql' })

app.listen({port: 8000}, () => {
  console.log('Apollo Server on http://localhost:8000/graphql')
})
