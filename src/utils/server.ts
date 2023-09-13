import * as vscode from "vscode";
import { TrainingRunningState, TrainingStatus } from "../gql/generated/graphql";

type ServerItemAttributes = {
  iconPath?: vscode.ThemeIcon;
  description?: string;
  tooltip?: string;
  contextValue?: string;
};

export function getServerItemAttributes(
  status: TrainingStatus,
  state: TrainingRunningState
): ServerItemAttributes {
  switch (status) {
    case TrainingStatus.DEPLOY_SUCCESS:
      return getDeployedServerItemAttributes(state);
    case TrainingStatus.DEPLOYING:
      return {
        iconPath: new vscode.ThemeIcon(
          "vm",
          new vscode.ThemeColor("problemsInfoIcon.foreground")
        ),
        description: "deploying",
        tooltip: "Server is being deployed, please wait for a few minutes",
      };
    case TrainingStatus.DESTROYING:
      return {
        iconPath: new vscode.ThemeIcon(
          "vm",
          new vscode.ThemeColor("problemsWarningIcon.foreground")
        ),
        description: "destroying",
        tooltip:
          "Server is being destroyed, remote connection is no longer allowed",
      };
    case TrainingStatus.DEPLOY_ERROR:
      return {
        iconPath: new vscode.ThemeIcon(
          "error",
          new vscode.ThemeColor("problemsErrorIcon.foreground")
        ),
        tooltip: "Failed to deploy server, please try again later",
      };
    case TrainingStatus.DESTROY_ERROR:
      return {
        iconPath: new vscode.ThemeIcon(
          "error",
          new vscode.ThemeColor("problemsErrorIcon.foreground")
        ),
        tooltip: "Failed to destroy server, please try again later",
      };
    default:
      return {};
  }
}

function getDeployedServerItemAttributes(
  state: TrainingRunningState
): ServerItemAttributes {
  switch (state) {
    case TrainingRunningState.RUNNING:
      return {
        iconPath: new vscode.ThemeIcon(
          "vm-running",
          new vscode.ThemeColor("debugIcon.startForeground")
        ),
        tooltip: "Server is ready for remote connection",
        contextValue: "RUNNING",
      };
    case TrainingRunningState.SLEEPING:
      return {
        iconPath: new vscode.ThemeIcon(
          "vm-outline",
          new vscode.ThemeColor("debugIcon.stopForeground")
        ),
        tooltip: "Server is sleeping",
        contextValue: "SLEEPING",
      };
    case TrainingRunningState.STARTING:
      return {
        iconPath: new vscode.ThemeIcon(
          "vm-outline",
          new vscode.ThemeColor("debugIcon.pauseForeground")
        ),
        description: "starting",
        tooltip: "Server is starting, please wait for a few minutes",
      };
    case TrainingRunningState.STOPPING:
      return {
        iconPath: new vscode.ThemeIcon(
          "vm-outline",
          new vscode.ThemeColor("debugIcon.pauseForeground")
        ),
        description: "stopping",
        tooltip:
          "Server is stopping, remote connection is not allowed until it is re-started",
      };
  }
}
