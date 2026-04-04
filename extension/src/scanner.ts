import * as vscode from 'vscode';
import { LANGUAGE_RULES, EnergyRule } from './rules';

export function scanCode(text: string, languageId: string): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    
    // Get language-specific rules or use universal fallback
    const rules: EnergyRule[] = [
        ...(LANGUAGE_RULES[languageId] || []),
        ...LANGUAGE_RULES["universal"]
    ];

    for (const rule of rules) {
        // Reset regex state since we use the 'g' flag
        rule.regex.lastIndex = 0;

        let match;
        while ((match = rule.regex.exec(text)) !== null) {
            const startOffset = match.index;
            const endOffset = match.index + match[0].length;

            const startPos = getPositionAt(text, startOffset);
            const endPos = getPositionAt(text, endOffset);
            const range = new vscode.Range(startPos, endPos);

            const diagnostic = new vscode.Diagnostic(
                range,
                `${rule.description} (Est. Saving: ${rule.saving}%)`,
                vscode.DiagnosticSeverity.Warning
            );
            diagnostic.code = rule.id;
            diagnostic.source = 'Code-Green Audit';
            diagnostics.push(diagnostic);
        }
    }

    return diagnostics;
}

// Utility to calculate position manually
function getPositionAt(text: string, offset: number): vscode.Position {
    let line = 0;
    let character = 0;
    for (let i = 0; i < offset; i++) {
        if (text[i] === '\n') {
            line++;
            character = 0;
        } else {
            character++;
        }
    }
    return new vscode.Position(line, character);
}
