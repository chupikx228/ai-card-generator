import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { getUserFromAuthHeader } from './auth.ts';
import { connectDB } from './db.ts';
import { type Context, resolvers } from './resolvers.ts';
import { typeDefs } from './schema.ts';

const DEFAULT_PORT = 4001;

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  throw new Error('MONGO_URI is not set');
}

await connectDB(mongoUri);

const server = new ApolloServer<Context>({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, {
  listen: { port: Number(process.env.PORT ?? DEFAULT_PORT) },
  context: async ({ req }) => ({ user: await getUserFromAuthHeader(req.headers.authorization) }),
});

console.log(`GraphQL API запущено за адресою: ${url}`);
