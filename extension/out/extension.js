"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const scanner_1 = require("./scanner");
let diagnosticCollection;
function activate(context) {
    console.log('Congratulations, your extension "code-green" is now active!');
    diagnosticCollection = vscode.languages.createDiagnosticCollection('code-green');
    context.subscriptions.push(diagnosticCollection);
    // Scan on document open
    vscode.workspace.onDidOpenTextDocument(doc => {
        scanDocument(doc);
    }, null, context.subscriptions);
    // Scan on document save
    vscode.workspace.onDidSaveTextDocument(doc => {
        scanDocument(doc);
    }, null, context.subscriptions);
    // Manual scan command
    let scanCommand = vscode.commands.registerCommand('code-green.scan', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            scanDocument(editor.document);
            vscode.window.showInformationMessage('Code-Green: Scan complete!');
        }
    });
    // Dashboard command
    let dashboardCommand = vscode.commands.registerCommand('code-green.openDashboard', () => {
        vscode.window.showInformationMessage('Code-Green: Opening Dashboard...');
        // Open the dashboard in a browser or webview
        const dashboardPath = path.join(context.extensionPath, '..', 'dashboard', 'dist', 'index.html');
        if (fs.existsSync(dashboardPath)) {
            vscode.env.openExternal(vscode.Uri.file(dashboardPath));
        }
        else {
            vscode.window.showErrorMessage('Code-Green Dashboard not built yet. Run "npm run build" in the dashboard directory.');
        }
    });
    context.subscriptions.push(scanCommand, dashboardCommand);
}
exports.activate = activate;
function scanDocument(doc) {
    if (!['java', 'python', 'cpp'].includes(doc.languageId)) {
        return;
    }
    const diagnostics = (0, scanner_1.scanCode)(doc.getText(), doc.languageId);
    diagnosticCollection.set(doc.uri, diagnostics);
    // Export stats to code-green-report.json in workspace root
    updateProjectReport(diagnostics, doc.languageId);
}
function updateProjectReport(diagnostics, language) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders)
        return;
    const reportPath = path.join(workspaceFolders[0].uri.fsPath, 'code-green-report.json');
    let report = {
        projectName: workspaceFolders[0].name,
        lastUpdate: new Date().toISOString(),
        score: 100,
        vampiresDetected: 0,
        potentialSavings: 0,
        languages: [],
        rulesFired: []
    };
    if (fs.existsSync(reportPath)) {
        try {
            report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        }
        catch (e) {
            // Handle parse error
        }
    }
    // Update report with new findings
    // For simplicity, we just aggregate for now
    diagnostics.forEach(d => {
        const ruleId = d.code;
        const rule = scanner_1.VAMPIRE_RULES.find(r => r.id === ruleId);
        if (rule) {
            report.vampiresDetected++;
            report.potentialSavings += rule.saving;
            const existingRule = report.rulesFired.find((rf) => rf.id === ruleId);
            if (existingRule) {
                existingRule.count++;
            }
            else {
                report.rulesFired.push({ id: ruleId, description: rule.description, count: 1, saving: rule.saving });
            }
        }
    });
    if (!report.languages.includes(language)) {
        report.languages.push(language);
    }
    // Calculate a simple score (starts at 100, drops for each vampire)
    report.score = Math.max(0, 100 - (report.vampiresDetected * 2));
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
}
function deactivate() {
    diagnosticCollection.clear();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map