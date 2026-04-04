import * as vscode from 'vscode';

export interface EnergyVampire {
    id: string;
    description: string;
    alternative: string;
    saving: number; // Percent energy saving
    regex: RegExp;
    language: string;
}

export const VAMPIRE_RULES: EnergyVampire[] = [
    // Java Rules
    {
        id: 'java-linked-list',
        language: 'java',
        description: 'LinkedList used. ArrayList is ~15% more energy-efficient for random access and iteration.',
        alternative: 'ArrayList',
        saving: 15,
        regex: /new\s+LinkedList\s*<\s*>\s*\(\s*\)/g
    },
    {
        id: 'java-raw-loop',
        language: 'java',
        description: 'Raw for-loop detected. Enhanced for-loops or Streams are more efficient for large collections.',
        alternative: 'Enhanced for-loop',
        saving: 5,
        regex: /for\s*\(\s*int\s+\w+\s*=\s*0;\s*\w+\s*<\s*\w+\.size\(\);\s*\w+\+\+\s*\)/g
    },
    // Python Rules
    {
        id: 'python-append-loop',
        language: 'python',
        description: 'Using .append() in a loop. List comprehensions are ~20% faster and more energy-efficient.',
        alternative: 'List Comprehension',
        saving: 20,
        regex: /for\s+\w+\s+in\s+.+:\s*\n?\s*\w+\.append\((\w+)\)/g
    },
    {
        id: 'python-redundant-api',
        language: 'python',
        description: 'Frequent polling detected. Consider WebSockets or Event-Driven patterns to save server cycles.',
        alternative: 'WebSockets',
        saving: 30,
        regex: /while\s+True:\s*\n?\s*requests\.get\(.+\)/g
    },
    // C++ Rules
    {
        id: 'cpp-pass-by-value',
        language: 'cpp',
        description: 'Large object passed by value. Pass by const reference (const T&) to save memory and CPU cycles.',
        alternative: 'const reference',
        saving: 12,
        regex: /\w+\s+\w+\s*\(std::string\s+\w+\)/g
    },
    {
        id: 'cpp-raw-pointer',
        language: 'cpp',
        description: 'Raw pointer usage. Smart pointers (unique_ptr/shared_ptr) ensure efficient memory lifecycle management.',
        alternative: 'std::unique_ptr',
        saving: 8,
        regex: /\w+\*\s+\w+\s*=\s*new\s+\w+/g
    }
];

export function scanCode(text: string, languageId: string): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    
    for (const rule of VAMPIRE_RULES) {
        if (rule.language !== languageId) continue;

        let match;
        while ((match = rule.regex.exec(text)) !== null) {
            const startPos = vscode.window.activeTextEditor?.document.positionAt(match.index) || new vscode.Position(0, 0);
            const endPos = vscode.window.activeTextEditor?.document.positionAt(match.index + match[0].length) || new vscode.Position(0, 0);
            const range = new vscode.Range(startPos, endPos);

            const diagnostic = new vscode.Diagnostic(
                range,
                `${rule.description} (Est. Saving: ${rule.saving}%)`,
                vscode.DiagnosticSeverity.Warning
            );
            diagnostic.code = rule.id;
            diagnostic.source = 'Code-Green';
            diagnostics.push(diagnostic);
        }
    }

    return diagnostics;
}
