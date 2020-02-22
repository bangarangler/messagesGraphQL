require('dotenv').config()

const cors = require('cors')
const express = require('express');
const { ApolloServer } = require('apollo-server-express');

const schema = require("./schema")
const resolvers = require("./resolvers")
// const models = require("./models")
const {models, sequelize } = require('./models')


const app = express()

app.use(cors())


  const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    formatError: error => {
      // remove internal sequelize error message
      // leave only the important validation error
      const message = error.message
        .replace('SequelizeValidationError: ', "")
        .replace('Validation error: ', "")
      return {
        ...error,
        message,
      }
    },
    context: async () => ({
      models,
      me: await models.User.findByLogin('jdain'),
      secret: process.env.SECRET,
    })
  })

server.applyMiddleware({ app, path: '/graphql' })

const eraseDatabaseOnSync = true;

sequelize.sync({force: eraseDatabaseOnSync}).then(async () => {
  if (eraseDatabaseOnSync) {
    createUsersWithMessages()
  }

  app.listen({ port: 8000 }, () => {
    console.log('Apollo Server on http://localhost:8000/graphql')
  })
})

const createUsersWithMessages = async () => {
  await models.User.create(
    {
      username: 'jdain',
      email: 'jon@test.com',
      password: 'testing',
      messages: [
        {
          text: 'Working on api'
        }
      ]
    },
    {
      include: [models.Message]
    }
  )

  await models.User.create(
    {
      username: 'kbacon',
      email: 'kevin@test.com',
      password: 'testing',
      messages: [
        {
          text: 'footlose is awesome!'
        },
        {
          text: 'sequal not to bad either...'
        }
      ]
    },
    {
      include: [models.Message]
    }
  )
}

// app.listen({port: 8000}, () => {
//   console.log('Apollo Server on http://localhost:8000/graphql')
// })
