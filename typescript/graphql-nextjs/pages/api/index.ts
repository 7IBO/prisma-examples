import "reflect-metadata"
import cors from "micro-cors"
import * as tq from "type-graphql"
import { ApolloServer } from "apollo-server-micro"
import prisma from "../../lib/prisma"
import { resolvers } from "@generated/type-graphql"
import { NextApiHandler } from "next"

export const config = {
  api: {
    bodyParser: false,
  },
}

let apolloServerHandler: NextApiHandler

async function getApolloServerHandler() {
  const schema = await tq.buildSchema({
    resolvers,
  })

  const apolloServer = new ApolloServer({ schema, context: { prisma } })

  if (!apolloServerHandler) {
    await apolloServer.start()

    apolloServerHandler = apolloServer.createHandler({
      path: "/api",
    })
  }

  return apolloServerHandler
}

const handler: NextApiHandler = async (req, res) => {
  const apolloServerHandler = await getApolloServerHandler()

  if (req.method === "OPTIONS") {
    res.end()
    return
  }

  return apolloServerHandler(req, res)
}

export default cors()(handler)
