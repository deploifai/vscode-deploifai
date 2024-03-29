import { ApolloClient, NormalizedCacheObject } from "@apollo/client/core";
import * as vscode from "vscode";
import ProjectTreeItem, {
  ProjectTreeProjectItem,
  ProjectTreeServerItem,
} from "../treeitems/Projects";
import {
  getUserProjects,
  projectFragment,
  trainingFragment,
} from "../utils/projects";
import createAPIClient from "../utils/api";
import { DeploifaiCredentials } from "../utils/credentials";
import { useFragment } from "../gql/generated";

export interface ProjectsProviderInit {
  apiClient: ApolloClient<NormalizedCacheObject>;
  username: string;
  context: vscode.ExtensionContext;
}

export class ProjectsProvider
  implements vscode.TreeDataProvider<ProjectTreeItem>
{
  apiClient: ApolloClient<NormalizedCacheObject>;
  username: string;
  loginStatus: boolean;
  context: vscode.ExtensionContext;

  private _onDidChangeTreeData: vscode.EventEmitter<
    ProjectTreeItem | undefined | null | void
  > = new vscode.EventEmitter<ProjectTreeItem | undefined | null | void>();

  readonly onDidChangeTreeData: vscode.Event<
    ProjectTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.username =
      this.context.globalState.get<string>("deploifaiUsername") ?? "";
    const credentials = this.context.globalState.get<DeploifaiCredentials>(
      "deploifaiCredentials"
    );
    this.apiClient = createAPIClient(credentials?.password ?? "");
    this.loginStatus = this.context.globalState.get(
      "deploifaiLoginStatus"
    ) as boolean;
  }

  refresh(username: string) {
    this.username = username;
    const credentials = this.context.globalState.get<DeploifaiCredentials>(
      "deploifaiCredentials"
    );
    this.apiClient = createAPIClient(credentials?.password ?? "");
    this.loginStatus = this.context.globalState.get(
      "deploifaiLoginStatus"
    ) as boolean;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ProjectTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: ProjectTreeItem): Promise<ProjectTreeItem[]> {
    if (this.loginStatus) {
      if (element) {
        const projectElement = element as ProjectTreeProjectItem;
        const trainingServers = useFragment(
          trainingFragment,
          projectElement.project.trainings
        );

        return trainingServers.map((trainingServer) => {
          return new ProjectTreeServerItem(trainingServer.name, trainingServer);
        });
      } else {
        // Top-level render projects
        const result = await getUserProjects(this.apiClient, this.username);
        const projects = useFragment(projectFragment, result.data.projects);
        return projects.map((project) => {
          return new ProjectTreeProjectItem(
            project.name,
            project,
            vscode.TreeItemCollapsibleState.Expanded
          );
        });
      }
    } else {
      return [];
    }
  }
}
