import * as vscode from "vscode";
import createAPIClient from "./api";
import getDeploifaiCredentials, {
  checkDeploifaiCredentials,
} from "./credentials";
import { getUserWorkspaces } from "./projects";

export class InitAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InitAuthError";
  }
}

export default async function init(context: vscode.ExtensionContext) {
  const deploifaiCredentials = await getDeploifaiCredentials();

  if (deploifaiCredentials === null) {
    context.globalState.update("deploifaiLoginStatus", false);
  } else {
    context.globalState.update("deploifaiLoginStatus", true);
    vscode.commands.executeCommand("setContext", "deploifaiLoggedIn", true);

    context.globalState.update("deploifaiCredentials", deploifaiCredentials);

    const client = createAPIClient(deploifaiCredentials.password);

    const username: string = deploifaiCredentials.account;
    context.globalState.update("deploifaiUsername", username);

    const isValid = await checkDeploifaiCredentials();
    if (!isValid) throw new InitAuthError("Invalid credentials");

    context.globalState.update("deploifaiWorkspace", username);

    const workspaces = await getUserWorkspaces(client);
    context.globalState.update("deploifaiWorkspaces", workspaces);
  }
}

export async function clearContext(context: vscode.ExtensionContext) {
  context.globalState.update("deploifaiLoginStatus", false);
  vscode.commands.executeCommand("setContext", "deploifaiLoggedIn", false);

  const username: string = "";
  context.globalState.update("deploifaiUsername", username);

  context.globalState.update("deploifaiWorkspaces", []);
}
