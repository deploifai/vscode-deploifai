import { ApolloClient, NormalizedCacheObject, gql } from "@apollo/client/core";
import * as vscode from "vscode";
import Projects, {
  ProjectTreeProjectItem,
  ProjectTreeServerItem,
} from "../treeitems/Projects";
import { getUserProjects } from "../utils/projects";

export interface ProjectsProviderInit {
  apiClient: ApolloClient<NormalizedCacheObject>;
  username: string;
}

export class ProjectsProvider implements vscode.TreeDataProvider<Projects> {
  apiClient: ApolloClient<NormalizedCacheObject>;
  username: string;

  private _onDidChangeTreeData: vscode.EventEmitter<
    Projects | undefined | null | void
  > = new vscode.EventEmitter<Projects | undefined | null | void>();

  readonly onDidChangeTreeData: vscode.Event<
    Projects | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor({ apiClient, username }: ProjectsProviderInit) {
    this.apiClient = apiClient;
    this.username = username;
  }

  refresh(username: string) {
    this.username = username;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Projects): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: Projects): Promise<Projects[]> {
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
  }
}
