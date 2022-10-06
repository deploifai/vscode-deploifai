import * as vscode from "vscode";
import * as keytar from "keytar";
import fetch from "node-fetch";

class LoginRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LoginRejectedError";
  }
}

async function getDeploifaiCredentials() {
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
  username: string,
  sessionToken: string
) {
  try {
    console.log(username, sessionToken);
    const response = await fetch("https://api.deploif.ai/auth/check/cli", {
      method: "POST",
      body: JSON.stringify({ username }),
      headers: {
        "Content-Type": "application/json",
        authorization: sessionToken,
      },
    });

    if (response.status === 401) {
      throw new LoginRejectedError("Login Rejected");
    } else if (response.status === 200) {
      await keytar.setPassword("deploifai-vscode", username, sessionToken);
      return true;
    }
  } catch (err) {
    console.log(err);
    if (err instanceof LoginRejectedError) {
      vscode.window.showErrorMessage("Invalid username or token");
    } else {
      vscode.window.showErrorMessage("Unknown error");
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
