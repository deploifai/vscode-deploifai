import { ApolloClient, NormalizedCacheObject } from "@apollo/client/core";
import { graphql } from "../gql/generated";
import { TrainingWhereUniqueInput } from "../gql/generated/graphql";

export const projectFragment = graphql(`
  fragment Project on Project {
    id
    name
    trainings(
      where: {
        status: {
          in: [
            DEPLOY_SUCCESS
            DEPLOYING
            DESTROYING
            DEPLOY_ERROR
            DESTROY_ERROR
          ]
        }
      }
    ) {
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
    status
    state
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

const startTrainingMutation = graphql(`
  mutation StartTraining($where: TrainingWhereUniqueInput!) {
    startTraining(where: $where) {
      ...Training
    }
  }
`);

const stopTrainingMutation = graphql(`
  mutation StopTraining($where: TrainingWhereUniqueInput!) {
    stopTraining(where: $where) {
      ...Training
    }
  }
`);

export async function getUserProjects(
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

export async function startTraining(
  apiClient: ApolloClient<NormalizedCacheObject>,
  where: TrainingWhereUniqueInput
) {
  return apiClient.mutate({
    mutation: startTrainingMutation,
    variables: { where },
  });
}

export async function stopTraining(
  apiClient: ApolloClient<NormalizedCacheObject>,
  where: TrainingWhereUniqueInput
) {
  return apiClient.mutate({
    mutation: stopTrainingMutation,
    variables: { where },
  });
}
