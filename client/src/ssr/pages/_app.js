import { ApolloProvider } from '@apollo/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../index.css';
import { createApolloClient } from '../lib/apollo-client';
import { AppContextProvider } from '../../context/AppContext';
import { SocketContextProvider } from '../../context/SocketContext';

// Instead of importing client directly, we create it for each request
// to support SSR properly
function MyApp({ Component, pageProps }) {
  const client = createApolloClient();

  return (
    <ApolloProvider client={client}>
      <AppContextProvider>
        <SocketContextProvider>
          <Component {...pageProps} />
          <ToastContainer position="top-right" autoClose={5000} />
        </SocketContextProvider>
      </AppContextProvider>
    </ApolloProvider>
  );
}

export default MyApp; 