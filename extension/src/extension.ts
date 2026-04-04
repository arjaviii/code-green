import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { VAMPIRE_RULES, scanCode } from './scanner';

let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext) {
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
		} else {
			vscode.window.showErrorMessage('Code-Green Dashboard not built yet. Run "npm run build" in the dashboard directory.');
		}
	});

	context.subscriptions.push(scanCommand, dashboardCommand);
}

function scanDocument(doc: vscode.TextDocument) {
	if (!['java', 'python', 'cpp'].includes(doc.languageId)) {
		return;
	}

	const diagnostics = scanCode(doc.getText(), doc.languageId);
	diagnosticCollection.set(doc.uri, diagnostics);

	// Export stats to code-green-report.json in workspace root
	updateProjectReport(diagnostics, doc.languageId);
}

function updateProjectReport(diagnostics: vscode.Diagnostic[], language: string) {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders) return;

	const reportPath = path.join(workspaceFolders[0].uri.fsPath, 'code-green-report.json');
	let report: any = {
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
		} catch (e) {
			// Handle parse error
		}
	}

	// Update report with new findings
	// For simplicity, we just aggregate for now
	diagnostics.forEach(d => {
		const ruleId = d.code as string;
		const rule = VAMPIRE_RULES.find(r => r.id === ruleId);
		if (rule) {
			report.vampiresDetected++;
			report.potentialSavings += rule.saving;
			
			const existingRule = report.rulesFired.find((rf: any) => rf.id === ruleId);
			if (existingRule) {
				existingRule.count++;
			} else {
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

export function deactivate() {
	diagnosticCollection.clear();
}
