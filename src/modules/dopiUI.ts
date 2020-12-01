/*
 * @Author: cijliu
 * @Date: 2020-11-05 15:11:26
 * @LastEditTime: 2020-12-01 10:57:23
 */
import * as vscode from 'vscode';
import { DopiProvider } from './dopiProvider';
import { language } from './language';
import {isConnect} from './serial'
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
			vscode.window.registerTreeDataProvider("Dopi-export-node", dopiDataProvider);
		},1000)
		

	}));
}