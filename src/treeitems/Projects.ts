import * as vscode from "vscode";
import { ProjectFragment, TrainingFragment } from "../gql/generated/graphql";
import { getServerItemAttributes } from "../utils/server";

class ProjectTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    collapsible: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsible);
  }
}

export class ProjectTreeProjectItem extends ProjectTreeItem {
  constructor(
    public readonly label: string,
    public readonly project: ProjectFragment,
    collapsible: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsible);
    this.id = project.id;
    this.project = project;
    this.iconPath = new vscode.ThemeIcon("repo");
  }
}

export class ProjectTreeServerItem extends ProjectTreeItem {
  constructor(
    public readonly label: string,
    readonly trainingServer: TrainingFragment
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.trainingServer = trainingServer;

    const { iconPath, description, tooltip, contextValue } =
      getServerItemAttributes(trainingServer.status, trainingServer.state);

    this.iconPath = iconPath;
    this.description = description;
    this.tooltip = tooltip;
    this.contextValue = contextValue;
  }
}

export default ProjectTreeItem;
