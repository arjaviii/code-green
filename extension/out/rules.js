"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXTENSION_MAP = exports.LANGUAGE_RULES = void 0;
exports.LANGUAGE_RULES = {
    // --- C-STYLE / MANAGED LANGUAGES ---
    "java": [
        { id: 'java-linked-list', description: 'LinkedList detected. ArrayList is ~15% more efficient.', alternative: 'ArrayList', saving: 15, regex: /new\s+LinkedList\s*(<.*?>)?\s*\(\s*\)/g, category: 'Memory' },
        { id: 'java-string-concat', description: 'String + in loop.', alternative: 'StringBuilder', saving: 25, regex: /(for|while)\s*\(.*?\)\s*\{[\s\S]*?\w+\s*\+=\s*.*?;[\s\S]*?\}/g, category: 'CPU' }
    ],
    "csharp": [
        { id: 'cs-list-to-array', description: 'ToList() in a loop creates redundant allocations.', alternative: 'Use existing collection', saving: 12, regex: /(for|foreach)\s*\(.*?\)\s*\{[\s\S]*?\.ToList\(\)[\s\S]*?\}/g, category: 'Memory' },
        { id: 'cs-linq-heavy', description: 'Heavy LINQ inside hot loops.', alternative: 'Simple for/foreach', saving: 18, regex: /(for|foreach)\s*\(.*?\)\s*\{[\s\S]*?\.(Where|Select|OrderBy)[\s\S]*?\}/g, category: 'CPU' }
    ],
    "javascript": [
        { id: 'js-foreach-slow', description: 'Array.forEach is slightly slower than a traditional for-loop.', alternative: 'for...of or for(i=0)', saving: 5, regex: /\.forEach\s*\(\s*.*?\s*=>/g, category: 'CPU' },
        { id: 'js-delete', description: 'Using "delete" on object properties prevents V8 optimizations.', alternative: 'Set to undefined/null', saving: 20, regex: /delete\s+\w+\[.*?\]|delete\s+\w+\.\w+/g, category: 'CPU' }
    ],
    "typescript": [
        { id: 'ts-any', description: 'Using "any" leads to unoptimized runtime checks.', alternative: 'Strict types', saving: 3, regex: /:\s*any/g, category: 'Algorithmic' }
    ],
    // --- SYSTEMS LANGUAGES ---
    "cpp": [
        { id: 'cpp-endl', description: 'std::endl in loop (excessive flushing).', alternative: '"\\n"', saving: 40, regex: /(for|while)\s*\(.*?\)\s*\{[\s\S]*?std::endl[\s\S]*?\}/g, category: 'I/O' },
        { id: 'cpp-vector-reserve', description: 'push_back without reserve.', alternative: 'reserve()', saving: 18, regex: /(?<!\.reserve\(.*?\);[\s\S]*?)(for|while)\s*\(.*?\)\s*\{[\s\S]*?\.push_back\([\s\S]*?\}/g, category: 'Memory' }
    ],
    "rust": [
        { id: 'rust-clone', description: 'Excessive .clone() calls on large objects.', alternative: 'Borrowing (&)', saving: 10, regex: /\.clone\(\)/g, category: 'Memory' },
        { id: 'rust-unwrap', description: 'Using .unwrap() in loops can lead to inefficient panic paths.', alternative: 'match or if let', saving: 5, regex: /(for|loop|while)[\s\S]*?\.unwrap\(\)/g, category: 'CPU' }
    ],
    "go": [
        { id: 'go-slice-realloc', description: 'Appending to slice without capacity hint.', alternative: 'make([]T, 0, cap)', saving: 15, regex: /append\(\w+,\s*.*?\)/g, category: 'Memory' }
    ],
    // --- SCRIPTING LANGUAGES ---
    "python": [
        { id: 'python-range-len', description: 'range(len()) anti-pattern.', alternative: 'enumerate()', saving: 10, regex: /for\s+\w+\s+in\s+range\s*\(\s*len\s*\(.*?\)\s*\)\s*:/g, category: 'Algorithmic' },
        { id: 'python-global', description: 'Global variable access in hot loop.', alternative: 'Local cache', saving: 8, regex: /global\s+.*?\n[\s\S]*?for.*?in.*?:\s*[\s\S]*?\w+/g, category: 'CPU' }
    ],
    "ruby": [
        { id: 'ruby-each-slow', description: 'Inefficient block iteration.', alternative: 'Symbol#to_proc', saving: 7, regex: /\.each\s*\{\s*\|\w+\|\s*\w+\.\w+\s*\}/g, category: 'CPU' }
    ],
    "php": [
        { id: 'php-count-loop', description: 'count() inside loop condition.', alternative: 'Cache count value', saving: 15, regex: /for\s*\(\s*.*?;s*\w+\s*<\s*count\s*\(.*?\);/g, category: 'Algorithmic' }
    ],
    // --- SPECIALIZED ---
    "sql": [
        { id: 'sql-select-star', description: 'SELECT * retrieves redundant data.', alternative: 'Specify columns', saving: 30, regex: /SELECT\s+\*\s+FROM/gi, category: 'I/O' },
        { id: 'sql-n-plus-one', description: 'Potential N+1 query pattern.', alternative: 'JOIN or IN clause', saving: 50, regex: /SELECT\s+.*?\s+FROM\s+.*?\s+WHERE\s+\w+\s*=\s*\?/gi, category: 'I/O' }
    ],
    "shellscript": [
        { id: 'sh-cat-grep', description: 'Useless use of cat.', alternative: 'grep pattern file', saving: 10, regex: /cat\s+.*?\s*\|\s*grep/g, category: 'I/O' }
    ],
    // --- UNIVERSAL FALLBACK (Applied to others) ---
    "universal": [
        { id: 'uni-nested-loop', description: 'Deeply nested loop (O(n^3)+). High energy consumption.', alternative: 'Optimize algorithm', saving: 45, regex: /(for|while|foreach)[\s\S]*?(for|while|foreach)[\s\S]*?(for|while|foreach)/g, category: 'Algorithmic' }
    ]
};
// Map of common file extensions to VS Code language IDs
exports.EXTENSION_MAP = {
    "java": "java",
    "py": "python",
    "js": "javascript",
    "ts": "typescript",
    "cpp": "cpp",
    "cc": "cpp",
    "cxx": "cpp",
    "cs": "csharp",
    "go": "go",
    "rs": "rust",
    "swift": "swift",
    "php": "php",
    "rb": "ruby",
    "kt": "kotlin",
    "sql": "sql",
    "sh": "shellscript",
    "pl": "perl",
    "lua": "lua",
    "jl": "julia",
    "hs": "haskell",
    "r": "r",
    "dart": "dart",
    "scala": "scala",
    "gro": "groovy",
    "sol": "solidity",
    "m": "matlab",
    "f90": "fortran",
    "ex": "elixir"
};
//# sourceMappingURL=rules.js.map