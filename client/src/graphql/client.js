import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

// Create the HTTP link
const httpLink = createHttpLink({
  uri: `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/graphql`,
  credentials: 'include',
});

// Create the WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(createClient({
  url: `${import.meta.env.VITE_BACKEND_URL?.replace('http', 'ws') || 'ws://localhost:4000'}/graphql`,
  connectionParams: () => {
    const token = localStorage.getItem('accessToken');
    return {
      Authorization: token ? `Bearer ${token}` : '',
    };
  },
}));

// Add auth headers to requests
const authLink = setContext((_, { headers }) => {
  // Get the token from localStorage
  const token = localStorage.getItem('accessToken');
  
  // Return the headers to the context
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Split links for subscriptions and queries
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

// Create Apollo Client
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

export default client; 