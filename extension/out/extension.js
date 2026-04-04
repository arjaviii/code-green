"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const scanner_1 = require("./scanner");
const rules_1 = require("./rules");
let diagnosticCollection;
let statusBarItem;
let globalScore = 100;
let currentPanel = undefined;
let outputChannel;
async function activate(context) {
    console.log('Code-Green is now active and auditing your workspace 🌿');
    outputChannel = vscode.window.createOutputChannel('Code-Green Audit');
    outputChannel.show(true);
    logToOutput('Starting Code-Green Global Auditor (30+ Languages Supported)...');
    diagnosticCollection = vscode.languages.createDiagnosticCollection('code-green');
    context.subscriptions.push(diagnosticCollection);
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = 'code-green.openDashboard';
    context.subscriptions.push(statusBarItem);
    statusBarItem.show();
    await scanWorkspace();
    vscode.workspace.onDidOpenTextDocument(doc => {
        scanDocument(doc);
    }, null, context.subscriptions);
    vscode.workspace.onDidSaveTextDocument(doc => {
        scanDocument(doc);
        scanWorkspace();
    }, null, context.subscriptions);
    let scanCommand = vscode.commands.registerCommand('code-green.scan', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            scanDocument(editor.document);
            scanWorkspace();
            vscode.window.showInformationMessage('Code-Green: Manual scan complete!');
        }
    });
    let dashboardCommand = vscode.commands.registerCommand('code-green.openDashboard', () => {
        if (currentPanel) {
            currentPanel.reveal(vscode.ViewColumn.One);
        }
        else {
            currentPanel = vscode.window.createWebviewPanel('codeGreenDashboard', 'Code-Green Sustainability Dashboard', vscode.ViewColumn.One, {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'webview'))]
            });
            currentPanel.webview.html = getWebviewContent(currentPanel.webview, context.extensionUri);
            currentPanel.onDidDispose(() => {
                currentPanel = undefined;
            }, null, context.subscriptions);
            currentPanel.webview.onDidReceiveMessage(message => {
                if (message.type === 'ready') {
                    sendReportToWebview();
                }
            }, null, context.subscriptions);
        }
    });
    context.subscriptions.push(scanCommand, dashboardCommand);
}
exports.activate = activate;
function logToOutput(message) {
    const timestamp = new Date().toLocaleTimeString();
    outputChannel.appendLine(`[${timestamp}] ${message}`);
}
function getWebviewContent(webview, extensionUri) {
    const webviewPath = path.join(extensionUri.fsPath, 'webview');
    const indexHtmlPath = path.join(webviewPath, 'index.html');
    let html = fs.readFileSync(indexHtmlPath, 'utf-8');
    const scriptRegex = /src="\.\/assets\/([^"]+)"/g;
    const styleRegex = /href="\.\/assets\/([^"]+)"/g;
    html = html.replace(scriptRegex, (match, src) => {
        const uri = webview.asWebviewUri(vscode.Uri.file(path.join(webviewPath, 'assets', src)));
        return `src="${uri}"`;
    });
    html = html.replace(styleRegex, (match, href) => {
        const uri = webview.asWebviewUri(vscode.Uri.file(path.join(webviewPath, 'assets', href)));
        return `href="${uri}"`;
    });
    return html;
}
async function scanWorkspace() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders)
        return;
    return vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Code-Green: Fleet Audit",
        cancellable: false
    }, async (progress) => {
        progress.report({ message: "Assembling the language fleet..." });
        // 1. Get ALL files in workspace to calculate coverage
        const allFiles = await vscode.workspace.findFiles('**/*', '**/node_modules/**');
        const supportedExtensions = Object.keys(rules_1.EXTENSION_MAP);
        const auditTargetFiles = [];
        const skippedFiles = [];
        allFiles.forEach(file => {
            const ext = path.extname(file.fsPath).toLowerCase().replace('.', '');
            if (supportedExtensions.includes(ext)) {
                auditTargetFiles.push(file);
            }
            else if (ext) {
                skippedFiles.push(file);
            }
        });
        const auditedFileList = auditTargetFiles.map(f => path.relative(workspaceFolders[0].uri.fsPath, f.fsPath));
        const skippedFileList = skippedFiles.map(f => path.relative(workspaceFolders[0].uri.fsPath, f.fsPath));
        let totalVampires = 0;
        let totalPotentialSaving = 0;
        const languagesFound = new Set();
        logToOutput(`Global session started. Language Fleet Coverage:`);
        logToOutput(`- Supported Files Found: ${auditTargetFiles.length}`);
        logToOutput(`- Files Skipped (Unsupported): ${skippedFiles.length}`);
        const report = {
            projectName: workspaceFolders[0].name,
            lastUpdate: new Date().toISOString(),
            score: 100,
            vampiresDetected: 0,
            potentialSavings: 0,
            filesAudited: auditTargetFiles.length,
            filesSkipped: skippedFiles.length,
            auditedFileList: auditedFileList,
            skippedFileList: skippedFileList,
            languages: [],
            rulesFired: []
        };
        const increment = 100 / (auditTargetFiles.length || 1);
        for (let i = 0; i < auditTargetFiles.length; i++) {
            const file = auditTargetFiles[i];
            const fileName = path.basename(file.fsPath);
            progress.report({ message: `Scrutinizing ${fileName}...`, increment: increment });
            const doc = await vscode.workspace.openTextDocument(file);
            const diagnostics = (0, scanner_1.scanCode)(doc.getText(), doc.languageId);
            diagnosticCollection.set(file, diagnostics);
            if (diagnostics.length > 0) {
                languagesFound.add(doc.languageId);
                logToOutput(`- Scanned: ${fileName} [detected ${diagnostics.length} inefficiencies]`);
            }
            diagnostics.forEach(d => {
                const ruleId = d.code;
                // Get rules for THIS language specifically, or universal fallback
                const rulesForLang = [...(rules_1.LANGUAGE_RULES[doc.languageId] || []), ...rules_1.LANGUAGE_RULES["universal"]];
                const rule = rulesForLang.find((r) => r.id === ruleId);
                if (rule) {
                    totalVampires++;
                    totalPotentialSaving += rule.saving;
                    const existingRule = report.rulesFired.find((rf) => rf.id === ruleId);
                    if (existingRule)
                        existingRule.count++;
                    else
                        report.rulesFired.push({ id: ruleId, description: rule.description, count: 1, saving: rule.saving });
                }
            });
        }
        globalScore = Math.max(0, 100 - (totalVampires * 1.2));
        report.score = globalScore;
        report.vampiresDetected = totalVampires;
        report.potentialSavings = totalPotentialSaving;
        report.languages = Array.from(languagesFound);
        updateStatusBar(globalScore);
        const reportPath = path.join(workspaceFolders[0].uri.fsPath, 'code-green-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        logToOutput(`Global Audit Complete. Fleet health: ${globalScore}%. Total issues identified: ${totalVampires}.`);
        if (currentPanel) {
            sendReportToWebview();
        }
    });
}
function sendReportToWebview() {
    if (!currentPanel)
        return;
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders)
        return;
    const reportPath = path.join(workspaceFolders[0].uri.fsPath, 'code-green-report.json');
    if (fs.existsSync(reportPath)) {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        currentPanel.webview.postMessage({ type: 'updateReport', data: report });
    }
}
function scanDocument(doc) {
    const supportedLanguages = Object.keys(rules_1.LANGUAGE_RULES).filter(k => k !== "universal");
    if (!supportedLanguages.includes(doc.languageId))
        return;
    const diagnostics = (0, scanner_1.scanCode)(doc.getText(), doc.languageId);
    diagnosticCollection.set(doc.uri, diagnostics);
}
function updateStatusBar(score) {
    let icon = '$(leaf)';
    let color = undefined;
    if (score < 50) {
        icon = '$(zap)';
        color = new vscode.ThemeColor('statusBarItem.errorBackground');
    }
    else if (score < 80) {
        icon = '$(alert)';
        color = new vscode.ThemeColor('statusBarItem.warningBackground');
    }
    statusBarItem.text = `${icon} Code-Green: ${score}%`;
    statusBarItem.tooltip = `Fleet Sustainability Score: ${score}% - Click to open dashboard`;
    statusBarItem.backgroundColor = color;
}
function deactivate() {
    if (statusBarItem)
        statusBarItem.dispose();
    if (diagnosticCollection)
        diagnosticCollection.dispose();
    if (outputChannel)
        outputChannel.dispose();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map