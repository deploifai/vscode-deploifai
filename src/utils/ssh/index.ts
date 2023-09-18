import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import * as http from "https";
import * as vscode from "vscode";
const sshConfig = require("ssh-config");

export interface BaseSSHConfig {
  hostId: string;
  hostname: string;
  user: string;
  privateKeyFilePath: string;
}

export function createSSHDir() {
  const homeDirectory = os.homedir();
  const sshDirPath = path.join(homeDirectory, ".ssh");

  if (!fs.existsSync(sshDirPath)) {
    fs.mkdirSync(sshDirPath);
  }
}

export function getSSHConfigPath(): string {
  const homeDirectory = os.homedir();
  const configFilePath = path.join(homeDirectory, ".ssh", "config");

  return configFilePath;
}

export function readSSHConfig(configFilePath: string): any {
  if (fs.existsSync(configFilePath)) {
    const contents = fs.readFileSync(configFilePath, "utf-8");
    const parsedConfig = sshConfig.parse(contents);
    return parsedConfig;
  }
}

export function getIdentityFilePathInSection(section: any) {
  for (const line of section.config) {
    if (line.param === "IdentityFile") {
      return line.value;
    }
  }
}

export function sshHostSection(hostId: string, sshConfig: any): any {
  if (sshConfig) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const section = sshConfig.find({ Host: hostId });
    return section;
  }

  return undefined;
}

export function sshHostKeyExists(section: any) {
  const sshKeyPath = getIdentityFilePathInSection(section);
  return fs.existsSync(sshKeyPath);
}

/**
 * Appends SSH config to the ssh config file. Creates a new config file if it does not exist.
 * @param sshConfigPath The file in which the config will be appended.
 * @param config The SSH config parameters
 */
export function appendSSHConfig(sshConfigPath: string, config: BaseSSHConfig) {
  const newConfig = sshConfig.parse(``).append({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Host: config.hostId,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    HostName: config.hostname,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    User: config.user,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    IdentityFile: config.privateKeyFilePath,
  });
  const newConfigString = os.EOL + sshConfig.stringify(newConfig) + os.EOL;
  fs.appendFileSync(sshConfigPath, newConfigString); // Will create a new file if it does not exist
}

/**
 * Create a SSH Key file in the filesystem.
 * This function will "unlock" the key file so that it can be written to.
 * @param identityFileURL The URL of the key file from where it can be retrieved from.
 * @param destinationFile The file to which the SSH private key must be written
 */
export async function createSSHKeyFile(
  identityFileURL: string,
  destinationFile: string
) {
  let isSSHKeyFetched = false;
  let sshKeyAlreadyExists = false;

  if (fs.existsSync(destinationFile)) {
    // If the file already exists, it is likely that the file is in 400 permissions, must be changed
    fs.chmodSync(destinationFile, 0o644);
    fs.copyFileSync(destinationFile, `${destinationFile}.bkp`);
    sshKeyAlreadyExists = true;
  }
  // Immediately opening and closing will just create a file
  fs.closeSync(fs.openSync(destinationFile, "w"));
  fs.chmodSync(destinationFile, 0o644);

  const tlsFileStream = fs.createWriteStream(destinationFile, {
    flags: "w",
  });

  try {
    await new Promise((resolve, reject) => {
      http.get(identityFileURL, (response) => {
        response.on("end", () => {
          resolve("Completed");
          isSSHKeyFetched = true;
        });

        response.on("error", (err) => {
          reject(err);
        });

        response.on("close", () => {
          if (!isSSHKeyFetched) {
            reject("HTTP connection closed before the file completed download");
          }
        });

        response.pipe(tlsFileStream);
      });
    });
  } catch (err) {
    tlsFileStream.close();
    if (sshKeyAlreadyExists) {
      // Restore the bkp file since the TLS key file may have been tainted
      fs.unlinkSync(destinationFile);
      fs.renameSync(`${destinationFile}.bkp`, destinationFile);
    } else {
      // Only delete if the file did not already exist
      fs.unlinkSync(destinationFile);
    }
  }

  tlsFileStream.close();

  if (sshKeyAlreadyExists) {
    fs.unlinkSync(`${destinationFile}.bkp`);
  }

  if (fs.existsSync(destinationFile)) {
    // The file must eventually be 400 so that it cannot be used.
    fs.chmodSync(destinationFile, 0o400);
  }
}

/**
 * Utilizes the VSCode Remote connection plugin to create an SSH connection
 * @param hostId The host server ID for Deploifai
 * @param serverOpenPath Must provide absolute path
 */
export function openSSHConnectionToServer(
  hostId: string,
  serverOpenPath: string
) {
  if (serverOpenPath.startsWith("/")) {
    const connectionURL = vscode.Uri.parse(
      `vscode-remote://ssh-remote+${hostId}${serverOpenPath}`
    );
    vscode.commands.executeCommand("vscode.openFolder", connectionURL);
  } else {
    throw Error("The path passed in the function is not absolute");
  }
}
