# Packaging & Installing Code-Green

To use Code-Green on any machine and in any repository, you can package it as a `.vsix` file and install it locally in VS Code.

## Prerequisites
1.  **Node.js**: Ensure you have Node.js installed.
2.  **VSCE**: Install the VS Code Extension Manager globally:
    ```bash
    npm install -g @vscode/vsce
    ```

## Step 1: Build the Extension & Dashboard
From the `extension/` directory, run:
```bash
npm run build-all
```
This will:
- Compile the TypeScript extension code.
- Build the React dashboard and bundle it into the `extension/webview` folder.

## Step 2: Package into .vsix
From the `extension/` directory, run:
```bash
vsce package
```
This will create a file named `code-green-0.1.0.vsix`.

## Step 3: Install in VS Code
1.  Open VS Code.
2.  Go to the **Extensions** view (`Ctrl+Shift+X`).
3.  Click the **...** (More Actions) menu in the top right.
4.  Select **"Install from VSIX..."**.
5.  Choose the `code-green-0.1.0.vsix` file you just created.

---

### 🌿 Success!
Once installed, you'll see the **Code-Green** icon and sustainability score in your Status Bar (bottom left) for every project you open. Click the score to launch your personalized dashboard!
