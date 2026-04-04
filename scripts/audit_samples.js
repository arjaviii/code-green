const fs = require('fs');
const path = require('path');

const VAMPIRE_RULES = [
    {
        id: 'java-linked-list',
        language: 'java',
        description: 'LinkedList used. ArrayList is ~15% more energy-efficient.',
        saving: 15,
        regex: /new\s+LinkedList\s*<\s*>\s*\(\s*\)/g
    },
    {
        id: 'java-raw-loop',
        language: 'java',
        description: 'Raw for-loop detected. Enhanced for-loops are more efficient.',
        saving: 5,
        regex: /for\s*\(\s*int\s+\w+\s*=\s*0;\s*\w+\s*<\s*\w+\.size\(\);\s*\w+\+\+\s*\)/g
    },
    {
        id: 'python-append-loop',
        language: 'python',
        description: 'Using .append() in a loop. List comprehensions are ~20% faster.',
        saving: 20,
        regex: /for\s+\w+\s+in\s+.+:\s*\n?\s*\w+\.append\((\w+)\)/g
    },
    {
        id: 'cpp-pass-by-value',
        language: 'cpp',
        description: 'Large object passed by value. Pass by const reference to save cycles.',
        saving: 12,
        regex: /\w+\s+\w+\s*\(std::string\s+\w+\)/g
    }
];

const samplesDir = path.join(__dirname, '..', 'samples');
const reportPath = path.join(__dirname, '..', 'code-green-report.json');

const report = {
    projectName: 'code-green-samples',
    lastUpdate: new Date().toISOString(),
    score: 100,
    vampiresDetected: 0,
    potentialSavings: 0,
    languages: [],
    rulesFired: []
};

const files = fs.readdirSync(samplesDir);
files.forEach(file => {
    const ext = path.extname(file);
    let lang = '';
    if (ext === '.java') lang = 'java';
    else if (ext === '.py') lang = 'python';
    else if (ext === '.cpp') lang = 'cpp';

    if (!lang) return;
    if (!report.languages.includes(lang)) report.languages.push(lang);

    const content = fs.readFileSync(path.join(samplesDir, file), 'utf8');
    VAMPIRE_RULES.forEach(rule => {
        if (rule.language !== lang) return;
        const matches = content.match(rule.regex);
        if (matches) {
            report.vampiresDetected += matches.length;
            report.potentialSavings += rule.saving * matches.length;
            
            const existing = report.rulesFired.find(rf => rf.id === rule.id);
            if (existing) {
                existing.count += matches.length;
            } else {
                report.rulesFired.push({
                    id: rule.id,
                    description: rule.description,
                    count: matches.length,
                    saving: rule.saving
                });
            }
        }
    });
});

report.score = Math.max(0, 100 - (report.vampiresDetected * 2));
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log('Manual Audit Complete. Report generated at:', reportPath);
