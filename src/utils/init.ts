import * as vscode from "vscode";
import createAPIClient from "./api";
import getDeploifaiCredentials from "./credentials";
import { getUserWorkspaces } from "./projects";

export default async function init(context: vscode.ExtensionContext) {
  const deploifaiCredentials = await getDeploifaiCredentials();
  if (deploifaiCredentials === null) {
    context.globalState.update("deploifaiLoginStatus", false);
  } else {
    context.globalState.update("deploifaiLoginStatus", true);
    vscode.commands.executeCommand("setContext", "deploifaiLoggedIn", true);

    const client = createAPIClient(deploifaiCredentials);
    context.globalState.update("deploifaiAPIClient", client);

    const username: string = deploifaiCredentials.account;
    context.globalState.update("deploifaiUsername", username);

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
