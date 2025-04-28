import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useMemo } from 'react';

let apolloClient;

// Create Apollo client with proper SSR support
function createIsomorphicLink() {
  // For server-side rendering, use direct HTTP link without WebSocket
  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/graphql',
    credentials: 'include',
  });

  // Add auth headers to requests
  const authLink = setContext((_, { headers }) => {
    // Get token from localStorage on client side or from request context on server
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('accessToken') 
      : '';
    
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  return authLink.concat(httpLink);
}

// Create Apollo client
function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined', // true on server, false on client
    link: createIsomorphicLink(),
    cache: new InMemoryCache(),
  });
}

// Initialize the client
export function initializeApollo(initialState = null) {
  const _apolloClient = apolloClient ?? createApolloClient();

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();
    
    // Restore the cache using the data passed from getStaticProps/getServerSideProps
    // combined with the existing cached data
    _apolloClient.cache.restore({ ...existingCache, ...initialState });
  }
  
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient;
  
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;
  
  return _apolloClient;
}

// Use for Apollo client in components
export function useApollo(initialState) {
  const store = useMemo(() => initializeApollo(initialState), [initialState]);
  return store;
}

// Export for _app.js
export { createApolloClient }; 