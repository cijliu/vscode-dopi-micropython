/*
 * @Author: cijliu
 * @Date: 2020-11-05 15:11:26
 * @LastEditTime: 2020-12-04 15:55:25
 */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { dopi_search, dopi_connect, dopi_disconnect, micropython_run, micropython_install, micropython_stop,createTerminal } from './modules/serial';
import { DopiProvider } from './modules/dopiProvider';
import { ExamplesProvider } from './modules/examplesProvider';
import { FtpProvider } from './modules/ftpProvider';
import { dopi_examples_click, dopi_ftp_download, dopi_ftp_sync, dopi_ftp_upload, dopi_tutorial, dopi_ui_update, getWebViewContent } from './modules/dopiUI';
import * as path from 'path';
import {language, setLanguage, locale} from './modules/language';
import { VideoViewProvider } from './modules/videoProvider';

function getExamplesPath():string {
	return path.join(__dirname, '..', 'examples').replace(/\\/g, "/");
}
function getFTPPath():string {
	return "./app/res";
}
function yuv2rgb(){
	let yuv_path = path.join(__dirname, '..', 'resources','image.yuv').replace(/\\/g, "/");
	
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	//console.log("info:ftp link")
	//ftptest();
	setLanguage(locale.cn)
	createTerminal();
	let dopiDataProvider = new DopiProvider();
	vscode.window.registerTreeDataProvider("Dopi-export-node", dopiDataProvider);

	//vscode.window.showInformationMessage(getExamplesPath());
	let exampleDataProvider = new ExamplesProvider(getExamplesPath());
	let ftpDataProvider = new FtpProvider(getFTPPath());
	vscode.window.registerTreeDataProvider("Dopi-examples-node", exampleDataProvider);
	vscode.window.registerTreeDataProvider("Dopi-ftp-node", ftpDataProvider);

	vscode.window.showInformationMessage(language.message.welcome)
	//register commands
	context.subscriptions.push( dopi_search() );
	context.subscriptions.push( dopi_connect() );
	context.subscriptions.push( dopi_disconnect() );
	context.subscriptions.push( micropython_run() );
	context.subscriptions.push( micropython_install() );
	context.subscriptions.push( micropython_stop() );
	context.subscriptions.push( dopi_ftp_sync(ftpDataProvider) );
	context.subscriptions.push( dopi_ftp_upload(ftpDataProvider) );
	context.subscriptions.push( dopi_ftp_download(ftpDataProvider) );
	context.subscriptions.push( dopi_ui_update(dopiDataProvider) );
	context.subscriptions.push( dopi_examples_click() );
	context.subscriptions.push( dopi_tutorial(context));

	const video_provider = new VideoViewProvider(context.extensionUri, context);
	context.subscriptions.push(vscode.window.registerWebviewViewProvider(VideoViewProvider.viewType, video_provider));
	

}

// this method is called when your extension is deactivated
export function deactivate() {}
