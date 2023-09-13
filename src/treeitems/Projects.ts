import * as vscode from "vscode";
import { ProjectFragment, TrainingFragment } from "../gql/generated/graphql";

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
    this.iconPath = new vscode.ThemeIcon(
      "vm-connect"
      // new vscode.ThemeColor("problemsWarningIcon.foreground")
    );
    this.trainingServer = trainingServer;
    this.contextValue = "RUNNING";
  }
}

export class ProjectTreeLoginItem extends ProjectTreeItem {
  constructor() {
    super("Login to Deploifai", vscode.TreeItemCollapsibleState.None);
    this.iconPath = new vscode.ThemeIcon("sign-in");
    this.command = {
      command: "deploifai.login",
      title: "Login to Deploifai",
    };
  }
}

export default ProjectTreeItem;
