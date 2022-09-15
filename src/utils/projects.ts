import { ApolloClient, NormalizedCacheObject, gql } from "@apollo/client/core";

const GetProjects = gql`
  query GetProjectsInWorkspace($username: String!) {
    projects(whereAccount: { username: $username }) {
      id
      name
      trainings {
        id
        name
        tlsPresignedUrl
        vmPublicIps
        vmSSHUsername
      }
    }
  }
`;

export function getUserProjects(
  apiClient: ApolloClient<NormalizedCacheObject>,
  username: string
) {
  return apiClient.query({
    query: GetProjects,
    variables: {
      username,
    },
  });
}
