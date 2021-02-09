/*
 * @Author: cijliu
 * @Date: 2020-11-05 15:11:26
 * @LastEditTime: 2020-12-04 15:29:18
 */
import * as vscode from 'vscode';
import { DopiProvider } from './dopiProvider';
import { FtpProvider } from './ftpProvider';
import { language } from './language';
import {isConnect} from './serial';
import * as path from 'path';
import * as fs from 'fs';
import { visitLexicalEnvironment } from 'typescript';
export function dopi_ui_update(dopiDataProvider:DopiProvider): vscode.Disposable{
    return (vscode.commands.registerCommand('dopi.ui.update', () => {
		// The code you place here will be executed every time your command is executed
		setTimeout(()=>{
			dopiDataProvider.connect = isConnect();
			if(dopiDataProvider.connect){
				dopiDataProvider.device.label = language.label.linked;
			}
			else {
				dopiDataProvider.device.label = language.label.link;
			}
			dopiDataProvider.update();
			//vscode.window.registerTreeDataProvider("Dopi-export-node", dopiDataProvider);
		},1000)
		

	}));
}
export function dopi_ftp_sync(p:FtpProvider): vscode.Disposable{
	return (vscode.commands.registerCommand('dopi.ftp.sync', () => {
		//vscode.window.showInformationMessage("Try to disconnect: " + p.ftp_path)
		p.list(p,p.ftp_path);

	}));
}
export function dopi_ftp_upload(p:FtpProvider): vscode.Disposable{
	return (vscode.commands.registerCommand('dopi.ftp.upload', () => {
		//vscode.window.showInformationMessage("upload: " + p.ftp_path)
		const option:vscode.OpenDialogOptions = {
			canSelectFiles:true,
            canSelectFolders:false, 
            canSelectMany:false, 
			defaultUri:vscode.Uri.file(path.join("./")),
		};
		vscode.window.showOpenDialog(option).then(
			function(val:vscode.Uri[]|undefined){
				if(val == undefined){
					return;
				}
				//console.log(val[0].fsPath,fs.readFileSync(val[0].fsPath,'utf-8'),path.basename(val[0].fsPath))
				p.put(p,fs.readFileSync(val[0].fsPath,''), path.basename(val[0].fsPath));
			}
		);
	}));
}
export function dopi_examples_click(): vscode.Disposable{
	return vscode.commands.registerCommand('ExamplesTreeItem.itemClick', (label, filePath) => {
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
	})
}
export function dopi_ftp_download(p:FtpProvider): vscode.Disposable{
	return vscode.commands.registerCommand('FtpTreeItem.itemClick', (label, filePath) => {
		//TODO：可以获取文件内容显示出来，这里暂时只打印入参
		//vscode.window.showInformationMessage("filePath : " + filePath);
		//ftpDataProvider.get(filePath);
		
		if(label == language.ftp.sync || label == language.ftp.upload){
			return;
		}
		const option:vscode.SaveDialogOptions = {
			defaultUri:vscode.Uri.file(path.join("./".concat(label))),
		};
		vscode.window.showSaveDialog(option).then(
			function(val){
				if(val?.fsPath != undefined){
					p.get(filePath, val?.fsPath);
				}
			}
		);
	})
}
export function getWebViewContent(context:vscode.ExtensionContext, templatePath:string) {
    const resourcePath = path.join(context.extensionPath, templatePath);
	const dirPath = path.dirname(resourcePath);
	//console.log(resourcePath,dirPath)
    let html = fs.readFileSync(resourcePath, 'utf-8');
    // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
    html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
        return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
    });
    return html;
}
export function dopi_tutorial(context: vscode.ExtensionContext): vscode.Disposable{
	return vscode.commands.registerCommand('dopi.tutorial', function (uri) {
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
	})
}