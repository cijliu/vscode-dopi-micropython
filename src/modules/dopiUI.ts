import * as vscode from 'vscode';
import { DopiProvider } from './dopiProvider';
import {isConnect} from './serial'
export function dopi_ui_update(dopiDataProvider:DopiProvider): vscode.Disposable{
    return (vscode.commands.registerCommand('dopi.ui.update', () => {
		// The code you place here will be executed every time your command is executed
		setTimeout(()=>{
			dopiDataProvider.connect = isConnect();
			if(dopiDataProvider.connect){
				dopiDataProvider.device.label = 'Device had connected';
			}
			else {
				dopiDataProvider.device.label = 'Click to search serial';
			}
			dopiDataProvider.update();
			vscode.window.registerTreeDataProvider("Dopi-export-node", dopiDataProvider);
		},1000)
		

	}));
}