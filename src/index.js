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
    context: async () => ({
      models,
      me: await models.User.findByLogin('jdain')
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
