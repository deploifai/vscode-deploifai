import * as vscode from "vscode";

class ProjectsTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    collapsible: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsible);
  }
}

export class ProjectTreeProjectItem extends ProjectsTreeItem {
  constructor(
    public readonly label: string,
    public readonly project: any,
    collapsible: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsible);
    this.id = project.id;
    this.project = project;
    this.iconPath = new vscode.ThemeIcon("repo");
  }
}

export class ProjectTreeServerItem extends ProjectsTreeItem {
  constructor(public readonly label: string, readonly trainingServer: any) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.iconPath = new vscode.ThemeIcon("vm-connect");
    this.command = {
      command: "deploifaiProjects.openRemote",
      title: "Connect to remote server",
      arguments: [this.label, trainingServer],
    };
  }
}

export class ProjectTreeLoginItem extends ProjectsTreeItem {
  constructor() {
    super("Login to Deploifai", vscode.TreeItemCollapsibleState.None);
    this.iconPath = new vscode.ThemeIcon("plug");
    this.command = {
      command: "deploifai.login",
      title: "Login to Deploifai",
    };
  }
}

export default ProjectsTreeItem;
