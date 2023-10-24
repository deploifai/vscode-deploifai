import * as vscode from "vscode";
import fetch from "node-fetch";
import * as Store from "electron-store";

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

interface StoreData {
  credentials: DeploifaiCredentials;
}

const store = new Store({
  name: "deploifai-vscode",
  schema: {
    credentials: {
      type: "object",
      properties: {
        account: { type: "string" },
        password: { type: "string" },
      },
    },
  },
}) as Store<StoreData>;

console.log({ store });

async function getDeploifaiCredentials(): Promise<DeploifaiCredentials | null> {
  console.log("getting deploifai credentials");

  const credentials = store.get("credentials") as DeploifaiCredentials;
  console.log("got credentials:", credentials);

  if (credentials) {
    return credentials;
  }

  return null;
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
      store.set("credentials", {
        account: body.username,
        password: sessionToken,
      });
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
    store.delete("credentials");
  }
}

export default getDeploifaiCredentials;
