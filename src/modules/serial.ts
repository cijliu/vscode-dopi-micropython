import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import {exec, spawn} from 'child_process';
import * as iconv from 'iconv-lite';
import { worker } from 'cluster';
function getSerialTollPath():string {
	return path.join(__dirname, '..', '..', 'ampy').replace(/\\/g, "/");
}
function getSerialSearchCommand():string {
	let cmd:string = '';
	let serialtool_root_path: string = getSerialTollPath();
	if (os.type() === "Windows_NT") {
		cmd = serialtool_root_path + "/cli.exe";
		cmd = '"'.concat(cmd, '" -p query portscan');
	} else {
		if (os.type() === "Linux") {
			cmd = serialtool_root_path + "/cli";
			cmd = '"'.concat(cmd, '" -p query portscan');
		} else {
			cmd = serialtool_root_path + "/mac_ports_scan";
			cmd = '"'.concat(cmd, '"');
		}
	}
	return cmd;
}
function getSerialConnectCommand(port:string):string {
	let cmd:string = '';
	let serialtool_root_path: string = getSerialTollPath();
	if (os.type() === "Windows_NT") {
		cmd = serialtool_root_path + "/cli.exe";
		cmd = ''.concat(cmd, ' -p ',port, ' repl');
	} else {
		if (os.type() === "Linux") {
			cmd = serialtool_root_path + "/cli";
			cmd = '"'.concat(cmd, '" -p ',port, ' repl');
		} else {
			cmd = serialtool_root_path + "/cli_mac";
			cmd = '"'.concat(cmd, '" -p ',port, ' repl');
		}
	}
	return cmd;
}
function connectDopi(port:string){
	let cmd:string = getSerialConnectCommand(port);
	let check_cmd:string = cmd.concat(' -q dopi');
	exec(check_cmd,
		{ encoding: "binary" },
		function(error, stdout, stderr) {
			if(error){
				vscode.window.showInformationMessage('failed to connect, please check if the serial port is occupied by another application');
				return;
			}
			let terminal:vscode.Terminal = createTerminal();
			terminal.sendText(cmd);
			setCOM(port);
			//terminal.sendText('print("Welcome")');
			vscode.window.showInformationMessage(port.concat(' Connect Successful!'))
			vscode.commands.executeCommand('dopi.ui.update');
		}
	);

}
function disconnectDopi(port:string){
	let terminal:vscode.Terminal = createTerminal();
	terminal.sendText(String.fromCharCode(24), false);
	vscode.window.showInformationMessage(port.concat(' Disconnect Successful'))
	setCOM(undefined);
	vscode.commands.executeCommand('dopi.ui.update');
}
let terminal:vscode.Terminal|undefined = undefined;
function createTerminal(): vscode.Terminal {
	if(terminal !== undefined){
		var exist = false;
		var terminals = vscode.window.terminals;
		terminals.forEach(element => {
			if(element.name === 'Dopi Terminal'){
				terminal = element;
				exist = true;
				return ;
			}
		});
		if(exist){
			return terminal;
		}
		else{
			console.log('kill terminal')
			setCOM(undefined);
		}

	}
	terminal = vscode.window.createTerminal({
		name:'Dopi Terminal'
	});
	var lineBreak = os.type() === "Windows_NT" ? "\r\n" : "\n";
	terminal.show();
	terminal.sendText("".concat(lineBreak));
	terminal.sendText("Set-ItemProperty HKCU:Console VirtualTerminalLevel -Type DWORD 1");
	terminal.sendText("".concat(lineBreak));
	terminal.sendText("clear".concat(lineBreak));
	return terminal;
}
let COM:string|undefined = undefined;
function getCOM():string|undefined{
	return COM;
}
function setCOM(com:string|undefined){
	COM = com;
}
export function isConnect(): boolean{
	return (getCOM() !== undefined) ? true:false;
}
let items:vscode.QuickPickItem[] = [];
function showSerialport(){
	if(getCOM() === undefined){
		let cmd:string = getSerialSearchCommand();
		exec(cmd,
		{ encoding: "binary" },
		function(error, stdout, stderr) {
			if(error){
				vscode.window.showInformationMessage('Search serial port fail!');
				return;
			}
			let ports = iconv.decode(Buffer.alloc(stdout.toString().length, stdout.toString(), "binary"), "cp936").replace(/\[|\]|\'/g, "").split(",");
			items = [];
			ports.forEach(function(item){
				let description:string = 'Click to connect Dopi.';
				if(item.trim() === 'cant find any serial in system.') {
					description = '';
				}
				items.push({label:item.trim(), description:description})
			});
			let serialport = vscode.window.createQuickPick();
			serialport.items = items;
			serialport.onDidChangeSelection(function(sel) {
				let serial = sel[0]
				let port:string = serial.label;
				vscode.commands.executeCommand('dopi.connect',port);
				serialport.hide();

			});
			serialport.show();
		});
	}
	else{
		let connect_items:vscode.QuickPickItem[] = [];
		items.forEach(function(item){
			let description:string = 'Device had connected, click to disconnect.';
			if(item.label == getCOM()){
				item.description = description;
				connect_items.push(item)
			}
		});
		let serialport = vscode.window.createQuickPick();
		serialport.items = connect_items;
		serialport.onDidChangeSelection(function(sel) {
			let serial = sel[0]
			let port:string = serial.label;
			if(port === getCOM()){
				vscode.commands.executeCommand('dopi.disconnect',port)
				serialport.hide();
			}
		});
		serialport.show();
	}
}
function getCodeFormat(code:string):string{
	return "".concat(String.fromCharCode(5), code, String.fromCharCode(4));
}
function GetStopCodeFormat():string {
	return "".concat(String.fromCharCode(3));
}
/* commands export */
export function dopi_search() : vscode.Disposable{
    return (vscode.commands.registerCommand('dopi.search', () => {
		vscode.window.showInformationMessage("Waitting Search.")
		createTerminal();
		showSerialport();
	}));
}
export function dopi_connect(): vscode.Disposable{
	return (vscode.commands.registerCommand('dopi.connect', (port:string) => {
		//vscode.window.showInformationMessage("Try to connect: " + port)
		connectDopi(port);
		//vscode.commands.executeCommand('dopi.ui.update');

	}));
}
export function dopi_disconnect(): vscode.Disposable{
	return (vscode.commands.registerCommand('dopi.disconnect', (port:string) => {
		//vscode.window.showInformationMessage("Try to disconnect: " + port)
		disconnectDopi(port);
		//vscode.commands.executeCommand('dopi.ui.update');
	}));
}

export function micropython_run(): vscode.Disposable{
	return (vscode.commands.registerCommand('dopi.run', (port:string) => {
		let code = vscode.window.activeTextEditor?.document.getText();
		if(code != undefined){
			code = getCodeFormat(code)
			terminal = createTerminal()
			let i:number = 0;
			let len :number = code.length
			let bufferLen = 1024
			while((len-i) > bufferLen){
				let s:string = code.substring(i, i+bufferLen)
				terminal.sendText(s,false)
				i = i + bufferLen;
			}
			terminal.sendText(code.substring(i),false)

		}
	}));
}

export function micropython_stop(): vscode.Disposable{
	return (vscode.commands.registerCommand('dopi.stop', (port:string) => {
		let code = GetStopCodeFormat();
		terminal = createTerminal()
		terminal.sendText(code)
	}));
}
