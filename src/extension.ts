/*
 * @Author: cijliu
 * @Date: 2020-11-05 15:11:26
 * @LastEditTime: 2020-12-01 14:47:24
 */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { dopi_search, dopi_connect, dopi_disconnect, micropython_run, micropython_install, micropython_stop,createTerminal } from './modules/serial';
import { DopiProvider } from './modules/dopiProvider';
import { ExamplesProvider } from './modules/examplesProvider';
import { dopi_ui_update } from './modules/dopiUI';
import * as path from 'path';
import * as fs from 'fs';
import {language, setLanguage, locale} from './modules/language'
function getExamplesPath():string {
	return path.join(__dirname, '..', 'examples').replace(/\\/g, "/");
}
function getWebViewContent(context:vscode.ExtensionContext, templatePath:string) {
    const resourcePath = path.join(context.extensionPath, templatePath);
    const dirPath = path.dirname(resourcePath);
    let html = fs.readFileSync(resourcePath, 'utf-8');
    // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
    html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
        return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
    });
    return html;
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	setLanguage(locale.cn)
	createTerminal();
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
	context.subscriptions.push(vscode.commands.registerCommand('dopi.tutorial', function (uri) {
		// 创建webview
		const panel = vscode.window.createWebviewPanel(
			'testWebview', // viewType
			"Dopi Tutorial", // 视图标题
			vscode.ViewColumn.One, // 显示在编辑器的哪个部位
			{
				enableScripts: true, // 启用JS，默认禁用
				retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
			}
		);
		panel.webview.html = getWebViewContent(context, 'resources/index.html');
	}));
	

}

// this method is called when your extension is deactivated
export function deactivate() {}
