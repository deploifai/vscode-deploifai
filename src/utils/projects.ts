import { ApolloClient, NormalizedCacheObject, gql } from "@apollo/client/core";

const getProjectsQuery = gql`
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

const getWorkspacesQuery = gql`
  query GetWorkspaces {
    me {
      account {
        username
      }
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
    query: getProjectsQuery,
    variables: {
      username,
    },
  });
}

export async function getUserWorkspaces(
  apiClient: ApolloClient<NormalizedCacheObject>
): Promise<string[]> {
  const result = await apiClient.query({
    query: getWorkspacesQuery,
  });

  const teamUsernames = result.data.me.teams.map(
    (team: any) => team.account.username
  );

  return [result.data.me.account.username, ...teamUsernames];
}
