// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { dopi_search, dopi_connect, dopi_disconnect, micropython_run, micropython_install, micropython_stop } from './modules/serial';
import { DopiProvider } from './modules/dopiProvider';
import { ExamplesProvider } from './modules/examplesProvider';
import { dopi_ui_update } from './modules/dopiUI';
import * as path from 'path';
import {language, setLanguage, locale} from './modules/language'
function getExamplesPath():string {
	return path.join(__dirname, '..', 'examples').replace(/\\/g, "/");
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	setLanguage(locale.cn)
	let dopiDataProvider = new DopiProvider();
	vscode.window.registerTreeDataProvider("Dopi-export-node", dopiDataProvider);

	//vscode.window.showInformationMessage(getExamplesPath());
	let exampleDataProvider = new ExamplesProvider(getExamplesPath());
	vscode.window.registerTreeDataProvider("Dopi-examples-node", exampleDataProvider);
	vscode.window.showInformationMessage(language.message.welcome)
	//register commands
	context.subscriptions.push( dopi_search() );
	context.subscriptions.push( dopi_connect() );
	context.subscriptions.push( dopi_disconnect() );
	context.subscriptions.push( micropython_run() );
	context.subscriptions.push( micropython_install() );
	context.subscriptions.push( micropython_stop() );
	context.subscriptions.push( dopi_ui_update(dopiDataProvider) );
	context.subscriptions.push(vscode.commands.registerCommand('ExamplesTreeItem.itemClick', (label, filePath) => {
		//TODO：可以获取文件内容显示出来，这里暂时只打印入参
		//vscode.window.showInformationMessage("filePath : " + filePath);
		vscode.workspace.openTextDocument(filePath).then(doc=>{
			// 在VSCode编辑窗口展示读取到的文本
			vscode.window.showTextDocument(doc);
		}, err=>{
			//vscode.window.showInformationMessage('Open string in window err,' + err);
		}).then(undefined, err => {
			vscode.window.showInformationMessage(`Open ${filePath} error, ${err}.`);
		});
	}));
	

}

// this method is called when your extension is deactivated
export function deactivate() {}
