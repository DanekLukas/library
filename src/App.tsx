import './App.less'
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client'
import { useRef } from 'react'
import LanguageProvider from './contexts/LanguageProvider'
import MessageProvider from './contexts/MessageProvider'
import Router from './Router'
import UserProvider from './contexts/UserProvider'

function App() {
  const fn = useRef<(message: string, timeout?: number) => void>()

  const link = new HttpLink({
    uri: `/graphql`,
    credentials: 'same-origin',
  })

  const apolloClient = new ApolloClient({
    cache: new InMemoryCache({
      typePolicies: {
        UnconventionalRootQuery: {
          // The RootQueryFragment can only match if the cache knows the __typename
          // of the root query object.
          queryType: true,
        },
      },
    }),
    link,
  })

  return (
    <MessageProvider fn={fn}>
      <ApolloProvider client={apolloClient}>
        <LanguageProvider>
          <UserProvider>
            <Router />
          </UserProvider>
        </LanguageProvider>
      </ApolloProvider>
    </MessageProvider>
  )
}

export default App
