import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as http from "https";
import * as vscode from "vscode";
const SSHConfig = require("ssh-config");

export async function openRemoteConnection(label: string, trainingServer: any) {
  console.log("Server name", label);
  console.log(trainingServer);

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

    fs.appendFileSync(openSSHConfigFilePath, SSHConfig.stringify(newConfig));
    fs.chmodSync(tlsFilePath, 400);

    const uri = vscode.Uri.parse(
      `vscode-remote://ssh-remote+${hostId}/home/ubuntu`
    );
    vscode.commands.executeCommand("vscode.openFolder", uri);
  }
}

export async function changeWorkspace(
  context: vscode.ExtensionContext,
  workspaces: string[]
) {
  return vscode.window.showQuickPick(workspaces, {
    onDidSelectItem(item) {
      context.globalState.update("deploifaiWorkspace", item);
    },
  });
}
