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

const GetWorkspaces = gql`
  query GetWorkspaces {
    me {
      teams {
        account {
          username
        }
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

export async function getUserWorkspaces(
  apiClient: ApolloClient<NormalizedCacheObject>
): Promise<string[]> {
  const result = await apiClient.query({
    query: GetWorkspaces,
  });

  return result.data.me.teams.map((team: any) => team.account.username);
}
