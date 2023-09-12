import { ApolloClient, NormalizedCacheObject } from "@apollo/client/core";
import * as vscode from "vscode";
import Projects, {
  ProjectTreeLoginItem,
  ProjectTreeProjectItem,
  ProjectTreeServerItem,
} from "../treeitems/Projects";
import { getUserProjects } from "../utils/projects";
import createAPIClient from "../utils/api";
import { DeploifaiCredentials } from "../utils/credentials";

export interface ProjectsProviderInit {
  apiClient: ApolloClient<NormalizedCacheObject>;
  username: string;
  context: vscode.ExtensionContext;
}

export class ProjectsProvider implements vscode.TreeDataProvider<Projects> {
  apiClient: ApolloClient<NormalizedCacheObject>;
  username: string;
  loginStatus: boolean;
  context: vscode.ExtensionContext;

  private _onDidChangeTreeData: vscode.EventEmitter<
    Projects | undefined | null | void
  > = new vscode.EventEmitter<Projects | undefined | null | void>();

  readonly onDidChangeTreeData: vscode.Event<
    Projects | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.username =
      (this.context.globalState.get("deploifaiUsername") as string) || "";
    const credentials = this.context.globalState.get(
      "deploifaiCredentials"
    ) as DeploifaiCredentials;
    this.apiClient = createAPIClient(credentials.password);
    this.loginStatus = this.context.globalState.get(
      "deploifaiLoginStatus"
    ) as boolean;
  }

  refresh(username: string) {
    this.username = username;
    const credentials = this.context.globalState.get(
      "deploifaiCredentials"
    ) as DeploifaiCredentials;
    this.apiClient = createAPIClient(credentials.password);
    this.loginStatus = this.context.globalState.get(
      "deploifaiLoginStatus"
    ) as boolean;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Projects): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: Projects): Promise<Projects[]> {
    if (this.loginStatus) {
      if (element) {
        const projectElement = element as ProjectTreeProjectItem;
        const trainingServers = projectElement.project.trainings;

        return trainingServers.map((trainingServer: any) => {
          const { id: trainingServerId, name: trainingServerName } =
            trainingServer;
          return new ProjectTreeServerItem(trainingServerName, trainingServer);
        });
      } else {
        // Top-level render projects
        const projects = await getUserProjects(this.apiClient, this.username);
        return projects.data.projects.map((project: any) => {
          const { id: projectId, name: projectName, trainings } = project;

          return new ProjectTreeProjectItem(
            projectName,
            project,
            vscode.TreeItemCollapsibleState.Expanded
          );
        });
      }
    } else {
      return [new ProjectTreeLoginItem()];
    }
  }
}
