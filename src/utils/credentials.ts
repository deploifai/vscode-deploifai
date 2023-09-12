import * as vscode from "vscode";
import * as keytar from "keytar";
import fetch from "node-fetch";

class LoginRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LoginRejectedError";
  }
}

export type DeploifaiCredentials = {
  account: string;
  password: string;
};

async function getDeploifaiCredentials(): Promise<DeploifaiCredentials | null> {
  const deploifaiVSCodeCredentials = await keytar.findCredentials(
    "deploifai-vscode"
  );
  if (deploifaiVSCodeCredentials.length) {
    return deploifaiVSCodeCredentials[0];
  } else {
    return null;
  }
}

export async function createDeploifaiCredentials(
  sessionToken: string
): Promise<string | undefined> {
  try {
    const response = await fetch("https://api.deploif.ai/auth/login/token", {
      method: "POST",
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "Content-Type": "application/json",
        authorization: sessionToken,
      },
    });

    if (response.status === 401) {
      throw new LoginRejectedError("Login Rejected");
    } else if (response.status === 200) {
      const body = await response.json();
      await keytar.setPassword("deploifai-vscode", body.username, sessionToken);
      return body.username;
    }
  } catch (err) {
    if (err instanceof LoginRejectedError) {
      vscode.window.showErrorMessage("Invalid token");
    } else {
      vscode.window.showErrorMessage("Unknown error");
    }
  }
  return undefined;
}

export async function removeDeploifaiCredentials() {
  const credentials = await getDeploifaiCredentials();
  if (credentials) {
    await keytar.deletePassword("deploifai-vscode", credentials?.account);
  }
}

export default getDeploifaiCredentials;
