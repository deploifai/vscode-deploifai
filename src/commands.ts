import * as path from "path";
import * as vscode from "vscode";
import {
  DeploifaiCredentials,
  createDeploifaiCredentials,
  removeDeploifaiCredentials,
} from "./utils/credentials";
import {
  appendSSHConfig,
  createSSHDir,
  createSSHKeyFile,
  getIdentityFilePathInSection,
  getSSHConfigPath,
  openSSHConnectionToServer,
  readSSHConfig,
  sshHostKeyExists,
  sshHostSection,
} from "./utils/ssh";
import { TrainingFragment } from "./gql/generated/graphql";
import { startTraining, stopTraining } from "./utils/projects";
import createAPIClient from "./utils/api";

export async function openRemoteConnection(trainingServer: TrainingFragment) {
  const hostId = trainingServer.id;
  const hostname = (trainingServer.vmPublicIps as string[])[0];
  const user = trainingServer.vmSSHUsername as string;
  const identityFileURL = trainingServer.tlsPresignedUrl as string;

  createSSHDir();

  const sshConfigFilePath = getSSHConfigPath();

  const targetHostSection = sshHostSection(
    hostId,
    readSSHConfig(sshConfigFilePath)
  );

  if (targetHostSection && sshHostKeyExists(targetHostSection)) {
    openSSHConnectionToServer(hostId, `/home/${user}`);
  } else if (targetHostSection && !sshHostKeyExists(targetHostSection)) {
    try {
      await createSSHKeyFile(
        identityFileURL,
        getIdentityFilePathInSection(targetHostSection)
      );
      openSSHConnectionToServer(hostId, `/home/${user}`);
    } catch (err) {
      // TODO: This error could be handled better?
      console.error(err);
    }
  } else {
    // Host is being configured for the first time
    const tlsFilePath = path.join(path.dirname(sshConfigFilePath), hostId);
    await createSSHKeyFile(identityFileURL, tlsFilePath);
    appendSSHConfig(sshConfigFilePath, {
      hostId,
      hostname,
      user,
      privateKeyFilePath: tlsFilePath,
    });
    openSSHConnectionToServer(hostId, `/home/${user}`);
  }
}

export async function changeWorkspace(context: vscode.ExtensionContext) {
  const workspaces = context.globalState.get("deploifaiWorkspaces") as string[];
  if (!context.globalState.get("deploifaiLoginStatus")) {
    await vscode.window.showInformationMessage("Not logged in", "OK");
    return null;
  }
  return vscode.window.showQuickPick(workspaces, {
    onDidSelectItem(item) {
      context.globalState.update("deploifaiWorkspace", item);
    },
  });
}

export async function startTrainingServer(
  context: vscode.ExtensionContext,
  trainingServer: TrainingFragment
) {
  const apiClient = getAPIClient(context);

  const { data, errors } = await startTraining(apiClient, {
    id: trainingServer.id,
  });

  if (errors && errors.length > 0) {
    vscode.window.showErrorMessage(errors[0].message);
  } else {
    vscode.window.showInformationMessage(
      `Starting training server: ${trainingServer.name}`
    );
  }
}

export async function stopTrainingServer(
  context: vscode.ExtensionContext,
  trainingServer: TrainingFragment
) {
  const apiClient = getAPIClient(context);

  const { data, errors } = await stopTraining(apiClient, {
    id: trainingServer.id,
  });

  if (errors && errors.length > 0) {
    vscode.window.showErrorMessage(errors[0].message);
  } else {
    vscode.window.showInformationMessage(
      `Stopping training server: ${trainingServer.name}`
    );
  }
}

export async function loginToDeploifai(): Promise<string | undefined> {
  const sessionToken = await vscode.window.showInputBox({
    title: "Personal access token",
  });

  if (sessionToken) {
    return await createDeploifaiCredentials(sessionToken);
  }
}

export async function logoutFromDeploifai() {
  const answer = await vscode.window.showInformationMessage(
    "Logout from Deploifai?",
    "No",
    "Yes"
  );
  if (answer && answer === "Yes") {
    await removeDeploifaiCredentials();
    return true;
  }
  return false;
}

function getAPIClient(context: vscode.ExtensionContext) {
  const credentials = context.globalState.get(
    "deploifaiCredentials"
  ) as DeploifaiCredentials;

  return createAPIClient(credentials.password);
}
