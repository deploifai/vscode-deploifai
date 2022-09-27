import * as vscode from "vscode";
import createAPIClient from "./api";
import { getUserWorkspaces } from "./projects";

export default async function init(
  context: vscode.ExtensionContext,
  deploifaiCredentials: { account: string; password: string } | null
) {
  if (deploifaiCredentials === null) {
    context.globalState.update("deploifaiLoginStatus", false);
  } else {
    context.globalState.update("deploifaiLoginStatus", true);

    const client = createAPIClient(deploifaiCredentials);
    context.globalState.update("deploifaiAPIClient", client);

    const username: string = deploifaiCredentials.account;
    context.globalState.update("deploifaiUsername", username);

    const workspaces = await getUserWorkspaces(client);
    context.globalState.update("deploifaiWorkspaces", workspaces);
  }
}
