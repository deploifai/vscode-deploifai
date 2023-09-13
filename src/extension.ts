// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ProjectsProvider } from "./providers/ProjectsProvider";
import {
  changeWorkspace,
  loginToDeploifai,
  logoutFromDeploifai,
  openRemoteConnection,
} from "./commands";
import { removeDeploifaiCredentials } from "./utils/credentials";
import init, { InitAuthError } from "./utils/init";
import { ProjectTreeServerItem } from "./treeitems/Projects";

export async function activate(context: vscode.ExtensionContext) {
  try {
    await init(context);
  } catch (err) {
    if (err instanceof InitAuthError) {
      // remove faulty credentials and re-initialize to reset the state of this extension
      await removeDeploifaiCredentials();
      await init(context);
    }
  }

  // Register commands
  const openRemoteCommand = "deploifaiProjects.openRemote";
  context.subscriptions.push(
    vscode.commands.registerCommand(
      openRemoteCommand,
      (node: ProjectTreeServerItem) => openRemoteConnection(node.trainingServer)
    )
  );

  const changeWorkspaceCommand = "deploifai.changeWorkspace";

  const projectsProvider = new ProjectsProvider(context);

  const loginCommand = "deploifai.login";
  const logoutCommand = "deploifai.logout";

  context.subscriptions.push(
    vscode.commands.registerCommand(loginCommand, async () => {
      const username = await loginToDeploifai();
      if (username) {
        await init(context);
        projectsProvider.refresh(username);
        vscode.commands.executeCommand("setContext", "deploifaiLoggedIn", true);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(logoutCommand, async () => {
      const loggedOut = await logoutFromDeploifai();
      if (loggedOut) {
        await init(context);
        projectsProvider.refresh("");
        vscode.commands.executeCommand(
          "setContext",
          "deploifaiLoggedIn",
          false
        );
      }
    })
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
