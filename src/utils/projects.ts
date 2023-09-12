import { ApolloClient, NormalizedCacheObject, gql } from "@apollo/client/core";
import { ProjectsProvider } from "../providers/ProjectsProvider";
import { graphql } from "../gql/generated";

const getProjectsQuery = graphql(`
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
`);

const getWorkspacesQuery = graphql(`
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
`);

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
    (team) => team.account.username
  );

  return [result.data.me.account.username, ...teamUsernames];
}
