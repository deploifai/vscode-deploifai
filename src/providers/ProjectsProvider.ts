import { ApolloClient, NormalizedCacheObject, gql } from "@apollo/client/core";
import * as vscode from "vscode";
import Projects, {
  ProjectTreeLoginItem,
  ProjectTreeProjectItem,
  ProjectTreeServerItem,
} from "../treeitems/Projects";
import { getUserProjects } from "../utils/projects";

export interface ProjectsProviderInit {
  apiClient: ApolloClient<NormalizedCacheObject>;
  username: string;
  context: vscode.ExtensionContext;
}

export class ProjectsProvider implements vscode.TreeDataProvider<Projects> {
  apiClient: ApolloClient<NormalizedCacheObject>;
  username: string;
  loginStatus: boolean;

  private _onDidChangeTreeData: vscode.EventEmitter<
    Projects | undefined | null | void
  > = new vscode.EventEmitter<Projects | undefined | null | void>();

  readonly onDidChangeTreeData: vscode.Event<
    Projects | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(context: vscode.ExtensionContext) {
    this.apiClient = context.globalState.get(
      "deploifaiAPIClient"
    ) as ApolloClient<NormalizedCacheObject>;
    this.username =
      (context.globalState.get("deploifaiUsername") as string) || "";

    this.loginStatus = context.globalState.get(
      "deploifaiLoginStatus"
    ) as boolean;
  }

  refresh(username: string) {
    this.username = username;
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
