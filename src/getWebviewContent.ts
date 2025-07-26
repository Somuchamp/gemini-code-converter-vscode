import * as vscode from 'vscode';

export function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
    // Get URIs for local resources (highlight.js CSS and JS)
    // For a real extension, you'd copy these files to a 'media' folder in your project
    // and use webview.asWebviewUri to get their webview-accessible URIs.
    // For this example, we'll use CDN links for simplicity, but local files are better for offline use.

    // CDN links for highlight.js (choose a style you like)
    const highlightJsCssUri = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css';
    const highlightJsCoreUri = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
    // Include common languages. You can add more specific ones if needed.
    const highlightJsLanguagesUri = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/javascript.min.js'; // Example language
    // It's better to load specific languages as needed or use a custom build.
    // For simplicity, we'll rely on highlightAll() which tries to auto-detect or uses common ones.

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gemini Code Converter</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="${highlightJsCssUri}"> <!-- Highlight.js CSS -->
        <style>
            body {
                font-family: 'Inter', sans-serif;
                background-color: var(--vscode-editor-background);
                color: var(--vscode-editor-foreground);
                padding: 25px;
                display: flex;
                flex-direction: column;
                height: 100vh;
                box-sizing: border-box;
                margin: 0;
                overflow: hidden;
            }
            .container {
                display: flex;
                flex-direction: column;
                height: 100%;
                gap: 25px;
                background-color: var(--vscode-editorGroup-background);
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                padding: 20px;
            }
            .header {
                flex-shrink: 0;
                padding-bottom: 15px;
                border-bottom: 1px solid var(--vscode-editorGroup-border);
                text-align: center;
            }
            .title {
                font-size: 32px;
                font-weight: 700;
                color: var(--vscode-editor-foreground);
                margin-bottom: 8px;
                text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
            }
            .subtitle {
                font-size: 15px;
                color: var(--vscode-foreground);
                opacity: 0.8;
            }
            .controls {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
                align-items: center;
                justify-content: center;
                margin-top: 20px;
            }
            select, button {
                padding: 12px 20px;
                border: none;
                background-color: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                border-radius: 8px;
                font-size: 15px;
                transition: all 0.3s ease-in-out;
                outline: none;
                box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            select:focus, textarea:focus {
                border: 1px solid var(--vscode-focusBorder);
                box-shadow: 0 0 0 2px var(--vscode-focusBorder);
            }
            button {
                cursor: pointer;
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                font-weight: 600;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
                border: 1px solid var(--vscode-button-border);
            }
            button:hover {
                background-color: var(--vscode-button-hoverBackground);
                box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
                transform: translateY(-2px);
            }
            button:active {
                transform: translateY(0);
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            }

            .editor-area {
                display: flex;
                flex-grow: 1;
                gap: 25px;
                overflow: hidden;
            }
            .textarea-wrapper {
                flex: 1;
                display: flex;
                flex-direction: column;
                position: relative;
            }
            textarea {
                flex: 1;
                min-height: 150px;
                font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
                font-size: 13px;
                background-color: var(--vscode-editorWidget-background);
                color: var(--vscode-editor-foreground);
                border: 1px solid var(--vscode-editorWidget-border);
                border-radius: 8px;
                resize: none;
                padding: 15px;
                box-sizing: border-box;
                line-height: 1.5;
                white-space: pre;
                word-wrap: normal;
                overflow: auto;
                box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.15);
            }
            textarea::placeholder {
                color: var(--vscode-input-placeholderForeground);
                opacity: 0.7;
            }

            /* Styling for the highlighted code block */
            pre code {
                display: block;
                padding: 15px;
                background: var(--vscode-editorWidget-background); /* Match textarea background */
                color: var(--vscode-editor-foreground);
                overflow: auto;
                border-radius: 8px;
                border: 1px solid var(--vscode-editorWidget-border);
                box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.15);
                height: 100%; /* Ensure it fills the space */
                box-sizing: border-box;
                font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
                font-size: 13px;
                line-height: 1.5;
            }

            .copy-button {
                position: absolute;
                top: 10px;
                right: 10px;
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                border-radius: 5px;
                padding: 5px 10px;
                cursor: pointer;
                font-size: 12px;
                opacity: 0.7;
                transition: opacity 0.2s ease-in-out;
            }
            .copy-button:hover {
                opacity: 1;
            }
            .message-box {
                background-color: var(--vscode-editorInfo-background); /* Default info background */
                color: var(--vscode-editorInfo-foreground); /* Default info foreground */
                border: 1px solid var(--vscode-editorInfo-border); /* Default info border */
                padding: 10px;
                border-radius: 5px;
                margin-top: 10px;
                text-align: center;
                display: none;
            }
            .message-box.error {
                background-color: var(--vscode-editorError-background);
                color: var(--vscode-editorError-foreground);
                border: 1px solid var(--vscode-editorError-border);
            }
            .message-box.warning {
                background-color: var(--vscode-editorWarning-background);
                color: var(--vscode-editorWarning-foreground);
                border: 1px solid var(--vscode-editorWarning-border);
            }


            /* Responsive adjustments */
            @media (max-width: 768px) {
                .container {
                    padding: 15px;
                }
                .editor-area {
                    flex-direction: column;
                }
                .controls {
                    flex-direction: column;
                    align-items: stretch;
                }
                select, button {
                    width: 100%;
                }
                .copy-button {
                    top: auto;
                    bottom: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: calc(100% - 20px);
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="title">✨ Gemini Code Converter</div>
                <div class="subtitle">Seamlessly convert code between languages using Google's Gemini AI.</div>
                <div class="controls">
                    <select id="fromLanguage">
                        <option value="C++">C++</option>
                        <option value="Java">Java</option>
                        <option value="Python">Python</option>
                        <option value="Ruby">Ruby</option>
                        <option value="JavaScript">JavaScript</option>
                        <option value="TypeScript">TypeScript</option>
                        <option value="Go">Go</option>
                        <option value="C#">C#</option>
                        <option value="PHP">PHP</option>
                        <option value="Swift">Swift</option>
                        <option value="Kotlin">Kotlin</option>
                        <option value="Rust">Rust</option>
                    </select>
                    <span>to</span>
                    <select id="toLanguage">
                        <option value="Python">Python</option>
                        <option value="Java">Java</option>
                        <option value="C++">C++</option>
                        <option value="Ruby">Ruby</option>
                        <option value="JavaScript">JavaScript</option>
                        <option value="TypeScript">TypeScript</option>
                        <option value="Go">Go</option>
                        <option value="C#">C#</option>
                        <option value="PHP">PHP</option>
                        <option value="Swift">Swift</option>
                        <option value="Kotlin">Kotlin</option>
                        <option value="Rust">Rust</option>
                    </select>
                    <button id="convertBtn">Convert Code</button>
                    <button id="clearBtn">Clear Source</button>
                </div>
            </div>
            <div class="editor-area">
                <div class="textarea-wrapper">
                    <textarea id="sourceCode" placeholder="Paste your source code here..."></textarea>
                </div>
                <div class="textarea-wrapper">
                    <!-- Changed from textarea to pre code for highlighting -->
                    <pre><code id="resultCode" class="language-plaintext">Conversion result will appear here...</code></pre>
                    <button id="copyBtn" class="copy-button">Copy Result</button>
                </div>
            </div>
            <div id="messageBox" class="message-box"></div>
        </div>

        <!-- Highlight.js scripts -->
        <script src="${highlightJsCoreUri}"></script>
        <!-- Load specific languages you expect, or omit for auto-detection (less reliable) -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/cpp.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/java.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/python.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/ruby.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/javascript.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/typescript.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/go.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/csharp.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/php.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/swift.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/kotlin.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/rust.min.js"></script>

        <script>
            // This script runs in the webview context
            (function() {
                const vscode = acquireVsCodeApi();

                const convertBtn = document.getElementById('convertBtn');
                const clearBtn = document.getElementById('clearBtn');
                const copyBtn = document.getElementById('copyBtn');
                const sourceCodeEl = document.getElementById('sourceCode');
                const resultCodeEl = document.getElementById('resultCode'); // Now a <code> element
                const fromLanguageEl = document.getElementById('fromLanguage');
                const toLanguageEl = document.getElementById('toLanguage');
                const messageBox = document.getElementById('messageBox');

                function showMessage(message, type = 'info') {
                    messageBox.textContent = message;
                    messageBox.className = 'message-box ' + type; // Apply class for styling
                    messageBox.style.display = 'block';
                    setTimeout(() => {
                        messageBox.style.display = 'none';
                    }, 5000);
                }

                convertBtn.addEventListener('click', () => {
                    const code = sourceCodeEl.value;
                    const from = fromLanguageEl.value;
                    const to = toLanguageEl.value;

                    if (!code.trim()) {
                        showMessage('Please paste some code to convert.', 'warning');
                        resultCodeEl.textContent = ''; // Use textContent for code element
                        return;
                    }

                    resultCodeEl.textContent = 'Converting... Please wait.'; // Use textContent
                    // Remove previous highlighting classes
                    resultCodeEl.className = 'language-plaintext'; // Reset to plain text before conversion
                    showMessage(\`Converting from ${from} to ${to}...\`, 'info'); // Escaped backticks

                    vscode.postMessage({
                        command: 'convert',
                        code: code,
                        from: from,
                        to: to
                    });
                });

                clearBtn.addEventListener('click', () => {
                    sourceCodeEl.value = '';
                    resultCodeEl.textContent = ''; // Use textContent
                    resultCodeEl.className = 'language-plaintext'; // Reset class
                    vscode.setState({ sourceCode: '', fromLanguage: fromLanguageEl.value, toLanguage: toLanguageEl.value });
                    showMessage('Source and result cleared.', 'info');
                });

                copyBtn.addEventListener('click', () => {
                    const textToCopy = resultCodeEl.textContent; // Use textContent for code element
                    if (textToCopy.trim() && textToCopy !== 'Conversion result will appear here...') {
                        const textarea = document.createElement('textarea');
                        textarea.value = textToCopy;
                        textarea.style.position = 'fixed';
                        textarea.style.left = '-9999px';
                        document.body.appendChild(textarea);
                        textarea.select();
                        try {
                            document.execCommand('copy');
                            showMessage('Result code copied to clipboard!', 'info');
                        } catch (err) {
                            showMessage('Failed to copy code. Please copy manually.', 'error');
                            console.error('Failed to copy text: ', err);
                        } finally {
                            document.body.removeChild(textarea);
                        }
                    } else {
                        showMessage('No code to copy.', 'warning');
                    }
                });

                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.command) {
                        case 'conversionResult':
                            resultCodeEl.textContent = message.code; // Set the text content
                            // Set the language class for highlight.js based on 'toLanguage' selection
                            const targetLang = toLanguageEl.value.toLowerCase();
                            resultCodeEl.className = \`language-${targetLang}\`; // Escaped backticks for template literal
                            hljs.highlightElement(resultCodeEl); // Highlight the specific element

                            if (message.code.startsWith('Error:')) {
                                showMessage('Conversion failed. Check the console for details.', 'error');
                            } else {
                                showMessage('Conversion complete!', 'info');
                            }
                            break;
                    }
                });

                // Optional: Save and restore webview state
                const previousState = vscode.getState();
                if (previousState && previousState.sourceCode) {
                    sourceCodeEl.value = previousState.sourceCode;
                    fromLanguageEl.value = previousState.fromLanguage || 'C++';
                    toLanguageEl.value = 'Python'; // Default to Python if not set
                    // Re-highlight if there was previous content
                    if (previousState.resultCode) {
                        resultCodeEl.textContent = previousState.resultCode;
                        const targetLang = previousState.toLanguage ? previousState.toLanguage.toLowerCase() : 'plaintext'; // Handle undefined targetLang
                        resultCodeEl.className = \`language-${targetLang}\`; // Escaped backticks
                        hljs.highlightElement(resultCodeEl);
                    }
                }

                // Update state whenever input changes (e.g., for persistence)
                sourceCodeEl.addEventListener('input', () => {
                    vscode.setState({
                        sourceCode: sourceCodeEl.value,
                        fromLanguage: fromLanguageEl.value,
                        toLanguage: toLanguageEl.value,
                        resultCode: resultCodeEl.textContent // Save result code too
                    });
                });
                fromLanguageEl.addEventListener('change', () => {
                    vscode.setState({
                        sourceCode: sourceCodeEl.value,
                        fromLanguage: fromLanguageEl.value,
                        toLanguage: toLanguageEl.value,
                        resultCode: resultCodeEl.textContent
                    });
                });
                toLanguageEl.addEventListener('change', () => {
                    vscode.setState({
                        sourceCode: sourceCodeEl.value,
                        fromLanguage: fromLanguageEl.value,
                        toLanguage: toLanguageEl.value,
                        resultCode: resultCodeEl.textContent
                    });
                });

                // Initial highlighting for the placeholder text
                hljs.highlightElement(resultCodeEl);
            }());
        </script>
    </body>
    </html>`;
}
