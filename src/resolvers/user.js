const jwt = require('jsonwebtoken');
const { combineResolvers } = require("graphql-resolvers");
const { AuthenticationError, UserInputError } = require("apollo-server");
const { isAdmin } = require("./authorization");

const createToken = async (user, secret, expiresIn) => {
  const { id, email, username, role } = user;
  return await jwt.sign({ id, email, username, role }, secret, {
    expiresIn,
  })
};

module.exports = {
  Query: {
    users: async (_, args, { models }) => {
      return await models.User.findAll()
    },
    user: async (_, { id }, { models }) => {
      return await models.User.findByPk(id)
    },
    me: async (_, args, { models, me }, info) => {
      if (!me) {
        return null;
      }
      return await models.User.findByPk(me.id)
    },
  },
  Mutation: {
    signUp: async (
      _, { username, email, password },
      { models, secret },
    ) => {
      const user = await models.User.create({
        username,
        email,
        password,
      });
      return { token: createToken(user, secret, '30m') }
    },
    signIn: async (
      parent,
      { login, password },
      { models, secret },
    ) => {
      const user = await models.User.findByLogin(login)

      if (!user) {
        throw new UserInputError(
          'No user found with this login credentials.'
        )
      }
      const isValid = await user.validatePassword(password)
      if (!isValid) {
        throw new AuthenticationError('Invalid password.')
      }
      return { token: createToken(user, secret, '30m') }
    },
    deleteUser: combineResolvers(
      isAdmin,
      async (_, { id }, { models }) => {
        return await models.User.destroy({
          where: { id }
        })
      }
      )
  },
  User: {
    messages: async (user, _, { models }) => {
      return await models.Message.findAll({
        where: {
          userId: user.id,
        }
      })
    }
  },
}
