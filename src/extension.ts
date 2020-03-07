// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { dopi_search, dopi_connect, dopi_disconnect, micropython_run, micropython_stop } from './modules/serial';
import { DopiProvider } from './modules/dopiProvider';
import { dopi_ui_update } from './modules/dopiUI';
import { join } from 'path';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let dopiDataProvider = new DopiProvider();
	vscode.window.registerTreeDataProvider("Dopi-export-node", dopiDataProvider);
	//register commands
	context.subscriptions.push( dopi_search() );
	context.subscriptions.push( dopi_connect() );
	context.subscriptions.push( dopi_disconnect() );
	context.subscriptions.push( micropython_run() );
	context.subscriptions.push( micropython_stop() );
	context.subscriptions.push( dopi_ui_update(dopiDataProvider) );

}

// this method is called when your extension is deactivated
export function deactivate() {}
