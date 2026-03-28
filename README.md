# Copilot → Teams Formatter

A VS Code extension that formats GitHub Copilot Chat output into a Microsoft Teams-friendly message and copies it to the clipboard.

## Usage

1. Copy from Copilot Chat using its copy button.
2. Run command: **Copilot: Format for Microsoft Teams (Clipboard → Clipboard)**
3. Paste into Teams.

You can also select text in an editor and run **Copilot: Format for Microsoft Teams (Selection → Clipboard)**.

## Settings

- `copilotTeams.keepCodeFenceLanguage` (default: true)
- `copilotTeams.convertLinksToPlain` (default: true)
- `copilotTeams.headingStyle` (default: bold)
- `copilotTeams.stripHtml` (default: true)

## Development

```bash
npm i
npm run build
```

Then press F5 in VS Code to run an Extension Development Host.
