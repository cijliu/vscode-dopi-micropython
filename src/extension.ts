// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { dopi_search, dopi_connect, dopi_disconnect } from './modules/serial';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	//register commands
	context.subscriptions.push( dopi_search() );
	context.subscriptions.push( dopi_connect() );
	context.subscriptions.push( dopi_disconnect() );
}

// this method is called when your extension is deactivated
export function deactivate() {}
