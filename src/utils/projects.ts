import { ApolloClient, NormalizedCacheObject } from "@apollo/client/core";
import { graphql } from "../gql/generated";

export const projectFragment = graphql(`
  fragment Project on Project {
    id
    name
    trainings {
      ...Training
    }
  }
`);

export const trainingFragment = graphql(`
  fragment Training on Training {
    id
    name
    tlsPresignedUrl
    vmPublicIps
    vmSSHUsername
  }
`);

const getProjectsQuery = graphql(`
  query GetProjectsInWorkspace($username: String!) {
    projects(whereAccount: { username: $username }) {
      ...Project
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
