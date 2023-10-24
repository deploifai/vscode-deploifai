// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ProjectsProvider } from "./providers/ProjectsProvider";
import {
  changeWorkspace,
  startTrainingServer,
  stopTrainingServer,
  loginToDeploifai,
  logoutFromDeploifai,
  openRemoteConnection,
} from "./commands";
import { removeDeploifaiCredentials } from "./utils/credentials";
import init, { InitAuthError } from "./utils/init";
import { ProjectTreeServerItem } from "./treeitems/Projects";

const loginCommand = "deploifai.login";
const logoutCommand = "deploifai.logout";
const changeWorkspaceCommand = "deploifai.changeWorkspace";
const refreshCommand = "deploifaiProjects.refresh";
const openRemoteCommand = "deploifaiProjects.openRemote";
const startServerCommand = "deploifaiProjects.startServer";
const stopServerCommand = "deploifaiProjects.stopServer";

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

  const projectsProvider = new ProjectsProvider(context);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand(
      openRemoteCommand,
      async (node: ProjectTreeServerItem) =>
        await openRemoteConnection(node.trainingServer)
    )
  );

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

  context.subscriptions.push(
    vscode.commands.registerCommand(refreshCommand, async () => {
      const workspace = context.globalState.get("deploifaiWorkspace") as string;
      projectsProvider.refresh(workspace);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      startServerCommand,
      async (node: ProjectTreeServerItem) => {
        await startTrainingServer(context, node.trainingServer);

        const workspace = context.globalState.get(
          "deploifaiWorkspace"
        ) as string;
        projectsProvider.refresh(workspace);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      stopServerCommand,
      async (node: ProjectTreeServerItem) => {
        await stopTrainingServer(context, node.trainingServer);

        const workspace = context.globalState.get(
          "deploifaiWorkspace"
        ) as string;
        projectsProvider.refresh(workspace);
      }
    )
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
