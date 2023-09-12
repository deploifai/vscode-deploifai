import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import fetch from "cross-fetch";

import introspectionResult from "../gql/generated/graphql";

function createAPIClient(authToken: string) {
  const httpLink = new HttpLink({
    uri: "https://api.deploif.ai/graphql",
    fetch,
  });

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: authToken,
      },
    };
  });

  const cache = new InMemoryCache({
    possibleTypes: introspectionResult.possibleTypes,
  });

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: cache,
  });

  return client;
}

export default createAPIClient;
