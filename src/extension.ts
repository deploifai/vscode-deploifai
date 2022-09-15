// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ProjectsProvider } from "./providers/ProjectsProvider";
import * as keytar from "keytar";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import { changeWorkspace, openRemoteConnection } from "./commands";
import fetch from "cross-fetch";

export async function activate(context: vscode.ExtensionContext) {
  // Register commands
  const openRemoteCommand = "deploifaiProjects.openRemote";
  const changeWorkspaceCommand = "deploifai.changeWorkspace";
  // Get credentials to communicate with GraphQL API
  const deploifaiCredentials = await keytar.findCredentials("deploifai-cli");
  const currentCredentials =
    deploifaiCredentials.length > 0 ? deploifaiCredentials[0] : null;

  // Create GraphQL API client
  const httpLink = new HttpLink({
    uri: "https://api.deploif.ai/graphql",
    fetch,
  });

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: currentCredentials ? currentCredentials.password : "",
      },
    };
  });

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });

  const username: string = currentCredentials?.account || "";
  const projectsProvider = new ProjectsProvider({
    apiClient: client,
    username,
  });

  // Register callbacks for commands
  context.subscriptions.push(
    vscode.commands.registerCommand(openRemoteCommand, openRemoteConnection)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(changeWorkspaceCommand, async () => {
      const selection = await changeWorkspace(context);
      if (selection) {
        projectsProvider.refresh(selection);
      }
    })
  );

  // Render in window
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider(
      "deploifaiProjects",
      projectsProvider
    )
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
