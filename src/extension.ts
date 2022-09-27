// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ProjectsProvider } from "./providers/ProjectsProvider";
import { changeWorkspace, openRemoteConnection } from "./commands";
import getDeploifaiCredentials from "./utils/credentials";
import init from "./utils/init";

export async function activate(context: vscode.ExtensionContext) {
  // Register commands
  const openRemoteCommand = "deploifaiProjects.openRemote";

  // Register callbacks for commands
  context.subscriptions.push(
    vscode.commands.registerCommand(openRemoteCommand, openRemoteConnection)
  );

  const changeWorkspaceCommand = "deploifai.changeWorkspace";
  const deploifaiCredentials = await getDeploifaiCredentials();

  await init(context, deploifaiCredentials);

  const projectsProvider = new ProjectsProvider(context);
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
