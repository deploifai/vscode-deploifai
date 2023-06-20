import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as http from "https";
import * as vscode from "vscode";
import {
  createDeploifaiCredentials,
  removeDeploifaiCredentials,
} from "./utils/credentials";
import init from "./utils/init";
const SSHConfig = require("ssh-config");

export async function openRemoteConnection(label: string, trainingServer: any) {
  const hostId = trainingServer.id;
  const hostname = trainingServer.vmPublicIps[0];
  const user = trainingServer.vmSSHUsername;
  const identityFileURL = trainingServer.tlsPresignedUrl;

  const homeDirectory = os.homedir();
  const openSSHConfigPath = path.join(homeDirectory, ".ssh");
  const openSSHConfigFilePath = path.join(openSSHConfigPath, "config");

  const configFileContents = fs.readFileSync(openSSHConfigFilePath, "utf-8");
  const config = SSHConfig.parse(`${configFileContents.toString()}`);
  if (config.find({ Host: hostId })) {
    const uri = vscode.Uri.parse(
      `vscode-remote://ssh-remote+${hostId}/home/ubuntu`
    );
    vscode.commands.executeCommand("vscode.openFolder", uri);
  } else {
    // Write the SSH Key to the file
    const tlsFilePath = path.join(openSSHConfigPath, hostId);
    const tlsFile = fs.createWriteStream(tlsFilePath);
    await new Promise((resolve, reject) => {
      try {
        http.get(identityFileURL, (response) => {
          response.on("end", function () {
            resolve("Download complete");
          });
          response.pipe(tlsFile);
        });
      } catch (err) {
        reject(err);
      }
    });

    const newConfig = SSHConfig.parse(``).append({
      Host: hostId,
      HostName: hostname,
      User: user,
      identityFile: tlsFilePath,
    });

    const newConfigString = "\r\n" + SSHConfig.stringify(newConfig) + "\r\n";

    fs.appendFileSync(openSSHConfigFilePath, newConfigString);
    fs.chmodSync(tlsFilePath, 0o400);

    const uri = vscode.Uri.parse(
      `vscode-remote://ssh-remote+${hostId}/home/ubuntu`
    );
    vscode.commands.executeCommand("vscode.openFolder", uri);
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

export async function loginToDeploifai() {
  const username = await vscode.window.showInputBox({
    title: "Username",
  });
  const sessionToken = await vscode.window.showInputBox({
    title: "Session Token",
  });

  if (username && sessionToken) {
    const loggedIn = await createDeploifaiCredentials(username, sessionToken);
    if (loggedIn) {
      return username;
    } else {
      return null;
    }
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
