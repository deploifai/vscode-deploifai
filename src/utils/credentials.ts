import * as vscode from "vscode";
import * as keytar from "keytar";
import fetch from "node-fetch";

class LoginRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LoginRejectedError";
  }
}

class CheckCredentialsRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckCredentialsRejectedError";
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
      vscode.window.showErrorMessage("Unknown error while logging in");
    }
  }
  return undefined;
}

export async function checkDeploifaiCredentials(): Promise<boolean> {
  const credentials = await getDeploifaiCredentials();

  if (credentials) {
    try {
      const response = await fetch("https://api.deploif.ai/auth/check/token", {
        method: "POST",
        body: JSON.stringify({ username: credentials.account }),
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          "Content-Type": "application/json",
          authorization: credentials.password,
        },
      });

      if (response.status === 401) {
        throw new CheckCredentialsRejectedError(
          "Checking credentials rejected"
        );
      } else if (response.status === 200) {
        return true;
      }
    } catch (err) {
      if (err instanceof CheckCredentialsRejectedError) {
        vscode.window.showErrorMessage("Invalid credentials");
      } else {
        vscode.window.showErrorMessage(
          "Unknown error while checking credentials"
        );
      }
    }
  }

  return false;
}

export async function removeDeploifaiCredentials() {
  const credentials = await getDeploifaiCredentials();
  if (credentials) {
    await keytar.deletePassword("deploifai-vscode", credentials?.account);
  }
}

export default getDeploifaiCredentials;
