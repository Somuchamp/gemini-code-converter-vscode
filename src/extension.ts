import * as vscode from 'vscode';
import { getWebviewContent } from './getWebviewContent';
import { GoogleGenerativeAI } from '@google/generative-ai';


const GEMINI_API_KEY_SECRET_KEY = 'geminiApiKey';

export function activate(context: vscode.ExtensionContext) {
    
    
    let disposable = vscode.commands.registerCommand('code-converter.start', async () => {

       
        let apiKey = await context.secrets.get(GEMINI_API_KEY_SECRET_KEY);

       
        if (!apiKey) {
            apiKey = await vscode.window.showInputBox({
                prompt: 'Please enter your Google Gemini API Key',
                password: true, 
                ignoreFocusOut: true, 
            });

            if (apiKey) {
                
                await context.secrets.store(GEMINI_API_KEY_SECRET_KEY, apiKey);
                vscode.window.showInformationMessage('Gemini API Key stored successfully!');
            } else {
                
                vscode.window.showErrorMessage('Gemini API Key is required to use the Code Converter.');
                return; 
            }
        }

        
        const panel = vscode.window.createWebviewPanel(
            'codeConverter', 
            'Code Converter', 
            vscode.ViewColumn.One, 
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
            }
        );

        panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);

        
        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'convert':
                        const { code, from, to } = message;
                        
                    
                        vscode.window.withProgress({
                            location: vscode.ProgressLocation.Notification,
                            title: `Converting code from ${from} to ${to}...`,
                            cancellable: false
                        }, async (progress) => {
                            try {
                                
                                const storedApiKey = await context.secrets.get(GEMINI_API_KEY_SECRET_KEY);
                                if (!storedApiKey) {
                                    vscode.window.showErrorMessage('API Key not found. Please restart the converter.');
                                    return;
                                }

                                const genAI = new GoogleGenerativeAI(storedApiKey);
                                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                                // Construct the prompt for the AI model
                                const prompt = `Translate the following code from ${from} to ${to}. Provide only the raw code as the answer, with no extra markdown formatting like \`\`\` or explanations.`;
                                
                                const result = await model.generateContent([prompt, code]);
                                const response = await result.response;
                                const convertedCode = response.text();

                                panel.webview.postMessage({ command: 'conversionResult', code: convertedCode });

                            } catch (error) {
                                console.error(error);
                                vscode.window.showErrorMessage('An error occurred during conversion. Check your API key and network.');
                                panel.webview.postMessage({ command: 'conversionResult', code: `Error: ${error}` });
                            }
                        });
                        return;
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}