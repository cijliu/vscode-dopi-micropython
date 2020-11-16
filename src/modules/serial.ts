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
function connectTelnet(ip:string){
	let cmd:string = 'telnet ';
	let check_cmd:string = cmd.concat(ip);
	vscode.window.showInformationMessage(check_cmd)
	let terminal:vscode.Terminal = createTerminal();
	terminal.sendText(check_cmd);


}
function disconnectTelnet(){
	let terminal:vscode.Terminal = createTerminal();
	terminal.sendText("exit");
	vscode.window.showInformationMessage(' Disconnect Successful')
	setServerIP(undefined);
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
			terminal.sendText(String.fromCharCode(3))
			setTimeout(() => {
				terminal.sendText('clear');
			}, 10); 
			setTimeout(() => {
				terminal.sendText(cmd);
			}, 100); 
			setCOM(port);
			//terminal.sendText('print("Welcome")');
			vscode.window.showInformationMessage(port.concat(' Connect Successful!'))
		}
	);

}
function disconnectDopi(port:string){
	let terminal:vscode.Terminal = createTerminal();
	terminal.sendText(String.fromCharCode(24), false);
	vscode.window.showInformationMessage(port.concat(' Disconnect Successful'))
	setCOM(undefined);
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
	//terminal.sendText("Set-ItemProperty HKCU:Console VirtualTerminalLevel -Type DWORD 1");
	//terminal.sendText("".concat(lineBreak));
	//terminal.sendText("clear".concat(lineBreak));
	return terminal;
}
let COM:string|undefined = undefined;
let SERVER:string|undefined = undefined;
let MICROPYTHON_STATUS:boolean = false;
function getCOM():string|undefined{
	return COM;
}
function setCOM(com:string|undefined){
	COM = com;
}
function getServerIP():string|undefined{
	return SERVER;
}
function setServerIP(ip:string|undefined){
	SERVER = ip;
}
export function isConnect(): boolean{
	return (getCOM() !== undefined || getServerIP() !== undefined) ? true:false;
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
function GetStartMicropython():string {
	return "".concat("micropython");
}
function GetStopMicropython():string {
	return "".concat(String.fromCharCode(4));
}
/* commands export */
export function dopi_search() : vscode.Disposable{
    return (vscode.commands.registerCommand('dopi.search', () => {
		vscode.window.showInformationMessage("Waitting Search.");
		createTerminal();
		//showSerialport();
		if(isConnect()){
			vscode.commands.executeCommand('dopi.disconnect');
			return;
		}
		vscode.window.showInputBox(
			{
				password:false,
				ignoreFocusOut:true, 
				placeHolder:'例如： 192.168.137.25',
				prompt:'输入Dopi设备IP进行连接', 
			
			}
		).then(function(msg){
			vscode.window.showInformationMessage("msg: " + msg)
			if(msg == undefined) {
				vscode.window.showInformationMessage("msg is null" )
				return;
			}
			let ip = msg.split('.');
			let key;
			if(ip.length != 4){
				vscode.window.showInformationMessage('ip format error!');
				return;
			}
			for(key in ip)
			{
			  //vscode.window.showInformationMessage("key: " + parseInt(ip[key]))
			  let num  =Number(ip[key]);
			  if (isNaN(num) || num > 255){
				vscode.window.showInformationMessage('ip format error!');
				return false;
			  }
			}
		   
			setServerIP(msg);
			//vscode.window.showInformationMessage("set ip: " + getServerIP())
			vscode.commands.executeCommand('dopi.connect');
		});
	}));
}
export function dopi_connect(): vscode.Disposable{
	return (vscode.commands.registerCommand('dopi.connect', (port:string) => {
		//vscode.window.showInformationMessage("Try to connect: " + port)
		vscode.window.showInformationMessage("Try to connect: " + getServerIP())
		//connectDopi(port);
		let ip:string|undefined = getServerIP();
		if(ip == undefined){
			vscode.commands.executeCommand('dopi.search');
			return;
		}
		connectTelnet(ip);
		vscode.commands.executeCommand('dopi.ui.update');

	}));
}
export function dopi_disconnect(): vscode.Disposable{
	return (vscode.commands.registerCommand('dopi.disconnect', (port:string) => {
		//vscode.window.showInformationMessage("Try to disconnect: " + port)

		//disconnectDopi(port);
		disconnectTelnet()
		vscode.commands.executeCommand('dopi.ui.update');
	}));
}
export function micropython_run(): vscode.Disposable{
	return (vscode.commands.registerCommand('dopi.run', (port:string) => {
		if(!isConnect()){
			vscode.window.showInformationMessage("请先进行设备连接")
			return;
		}
		if(MICROPYTHON_STATUS){
			vscode.commands.executeCommand('dopi.stop');
			setTimeout(()=>{
				vscode.commands.executeCommand('dopi.run');
			}, 500);
			return;

		}
		MICROPYTHON_STATUS = true;
		let code = vscode.window.activeTextEditor?.document.getText();
		if(code != undefined){
			code = getCodeFormat(code)
			terminal = createTerminal()
			let lineBreak = '\n';
			let lines = code.split(lineBreak)
			terminal.sendText(GetStartMicropython())
			setTimeout(()=>{
				lines.forEach((l, i)=>{
					let line = l + lineBreak
					//VSCode DEBUG: if you send  large code immediately, the terminal will run error, 
					//				so we only delay send each line wait a moment :)
					setTimeout(() => {
						if(terminal === undefined){
							return
						}
						terminal.sendText(line,false)
					}, i);
					
				})
			}, 200);
			
			
		}
	}));
}

export function micropython_stop(): vscode.Disposable{
	return (vscode.commands.registerCommand('dopi.stop', (port:string) => {
		if(!isConnect()){
			vscode.window.showInformationMessage("请先进行设备连接")
			return;
		}
		if(!MICROPYTHON_STATUS){
			vscode.window.showInformationMessage("没有程序正在运行")
			return;
		}
		MICROPYTHON_STATUS = false;
		let code = GetStopCodeFormat();
		terminal = createTerminal()
		terminal.sendText(code,false)
		setTimeout(()=>{
			terminal = createTerminal()
			code = GetStopMicropython();
			terminal.sendText(code,false)
		},200);
		
	}));
}
