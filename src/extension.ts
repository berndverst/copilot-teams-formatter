import * as vscode from "vscode";
import { formatForTeams } from "./formatter";

function getOptions() {
  const config = vscode.workspace.getConfiguration();
  return {
    keepCodeFenceLanguage: config.get<boolean>(
      "copilotTeams.keepCodeFenceLanguage",
      true
    ),
    convertLinksToPlain: config.get<boolean>(
      "copilotTeams.convertLinksToPlain",
      true
    ),
    headingStyle: config.get<"bold" | "keep">(
      "copilotTeams.headingStyle",
      "bold"
    ),
    stripHtml: config.get<boolean>("copilotTeams.stripHtml", true)
  };
}

export function activate(context: vscode.ExtensionContext) {
  const formatSelectionCmd = vscode.commands.registerCommand(
    "copilotTeams.copyFormattedSelection",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return;
      }

      const selection = editor.selection;
      const input =
        selection && !selection.isEmpty
          ? editor.document.getText(selection)
          : editor.document.getText();

      if (!input.trim()) {
        vscode.window.showWarningMessage("Nothing to format (empty input).
");
        return;
      }

      const formatted = formatForTeams(input, getOptions());
      await vscode.env.clipboard.writeText(formatted);

      vscode.window.setStatusBarMessage(
        "Copied Teams-formatted text to clipboard",
        2500
      );
    }
  );

  const formatClipboardCmd = vscode.commands.registerCommand(
    "copilotTeams.copyFormattedClipboard",
    async () => {
      const input = await vscode.env.clipboard.readText();
      if (!input.trim()) {
        vscode.window.showWarningMessage("Clipboard is empty.");
        return;
      }

      const formatted = formatForTeams(input, getOptions());
      await vscode.env.clipboard.writeText(formatted);

      vscode.window.setStatusBarMessage(
        "Replaced clipboard with Teams-formatted text",
        2500
      );
    }
  );

  context.subscriptions.push(formatSelectionCmd, formatClipboardCmd);
}

export function deactivate() {}