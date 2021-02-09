import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import {exec} from 'child_process';
import * as iconv from 'iconv-lite';
import {language} from './language'
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
function getTelnetConnectCommand():string {
	let cmd:string = '';
	let serialtool_root_path: string = path.join(__dirname, '..', '..', 'resources','telnet').replace(/\\/g, "/");
	if (os.type() === "Windows_NT") {
		cmd = serialtool_root_path + "/telnet.exe ";
	} else {
		if (os.type() === "Linux") {
			cmd = "telnet ";
		} 
	}
	return cmd;
}
function connectTelnet(ip:string){
	let cmd:string = process.platform === 'win32' ? getTelnetConnectCommand() : 'telnet '
	let check_cmd:string = cmd.concat(ip);
	//vscode.window.showInformationMessage(check_cmd)
	let terminal:vscode.Terminal = createTerminal();
	terminal.sendText(GetStopCodeFormat());
	terminal.sendText(check_cmd);


}
function disconnectTelnet(){
	//let terminal:vscode.Terminal = createTerminal();
	//terminal.sendText("exit");
	//terminal.sendText(GetStopCodeFormat());
	let name = process.platform === 'win32' ? 'telnet.exe' : 'telnet'
	killProcess(name);
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
			vscode.window.showInformationMessage(port.concat(language.message.connect_successful))
			vscode.commands.executeCommand('dopi.ui.update');
		}
	);

}
function findProcess(name:string, cb:any) :number{
	let cmd:string = process.platform === 'win32' ? 'tasklist' : 'ps aux'
	let check_cmd:string = cmd;
	exec(check_cmd,
		{ encoding: "binary" },
		function(error, stdout, stderr) {
			if(error){
				vscode.window.showInformationMessage('failed to connect, please check if the serial port is occupied by another application');
				return 0xff;
			}
			stdout.split('\n').filter((line) => {
				let processMessage = line.trim().split(/\s+/);
				let processName = processMessage[0]; //processMessage[0]进程名称 ， processMessage[1]进程id
				let peocessPID = parseInt(processMessage[1]);
				if (processName === name && cb != undefined) {
					if(!cb(processName, peocessPID)){
						return 1;
					}
				}
			})
			return 2;
			
		}
	);
	return 0;
}
function killProcess (name:string) {
	findProcess(name,function (name:string, pid:number) {
		process.kill(pid);
		return true;
	});
}
function detectProcess(name:string){
	let cmd:string = process.platform === 'win32' ? 'tasklist' : 'ps aux'
	let check_cmd:string = cmd;
	exec(check_cmd,
		{ encoding: "binary" },
		function(error, stdout, stderr) {
			if(error){
				vscode.window.showInformationMessage('failed to connect, please check if the serial port is occupied by another application');
				return false;
			}
			let ret = false;
			stdout.split('\n').filter((line) => {
				let processMessage = line.trim().split(/\s+/)
				let processName = processMessage[0] //processMessage[0]进程名称 ， processMessage[1]进程id
				if (processName === name) {
					//vscode.window.showInformationMessage(processName);
					ret = true;
					
				}
			  })
			if(ret == false){
				if(isConnect()){
					if(detectTimer != undefined){
						clearInterval(detectTimer);
						detectTimer = undefined;
					}
					vscode.commands.executeCommand('dopi.disconnect');
				}
			}
		}
	);
	
	

}
function disconnectDopi(port:string){
	let terminal:vscode.Terminal = createTerminal();
	terminal.sendText(String.fromCharCode(24), false);
	vscode.window.showInformationMessage(port.concat(language.message.disconnect_successful))
	setCOM(undefined);
	vscode.commands.executeCommand('dopi.ui.update');
}
let terminal:vscode.Terminal|undefined = undefined;
export function createTerminal(): vscode.Terminal {
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
			//console.log('kill terminal')
			setCOM(undefined);
		}

	}
	terminal = vscode.window.createTerminal({
		name:'Dopi Terminal'
	});
	var lineBreak = os.type() === "Windows_NT" ? "\r\n" : "\n";
	terminal.show();
	terminal.sendText("".concat(lineBreak));
	terminal.sendText("chcp 65001".concat(lineBreak));
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
export function getServerIP():string|undefined{
	return SERVER;
}
function setServerIP(ip:string|undefined){
	SERVER = ip;
}
export function isConnect(): boolean{
	return (getCOM() !== undefined || getServerIP() !== undefined) ? true:false;
}
let items:vscode.QuickPickItem[] = [];
/*
function showSerialport(){
	if(getCOM() === undefined){
		let cmd:string = getSerialSearchCommand();
		exec(cmd,
		{ encoding: "binary" },
		function(error, stdout, stderr) {
			if(error){
				//vscode.window.showInformationMessage('Search serial port fail!');
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
*/
function getCodeFormat(code:string):string{
	return "".concat(String.fromCharCode(5), code, String.fromCharCode(4));
}
export function GetStopCodeFormat():string {
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
		//vscode.window.showInformationMessage("Waitting Search.");
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
				placeHolder:language.device_connect.placeHolder,
				prompt:language.device_connect.prompt,

			}
		).then(function(msg){
			//vscode.window.showInformationMessage("msg: " + msg)
			if(msg == undefined) {
				//vscode.window.showInformationMessage("msg is null" )
				msg = "192.168.137.25";
				return;
			}
			if(msg == "") {
				msg = "192.168.137.25";
			}
			let ip = msg.split('.');
			let key;
			if(ip.length != 4){
				vscode.window.showInformationMessage(language.message.ip_format_err);
				return;
			}
			for(key in ip)
			{
			  //vscode.window.showInformationMessage("key: " + parseInt(ip[key]))
			  let num  =Number(ip[key]);
			  if (isNaN(num) || num > 255){
				vscode.window.showInformationMessage(language.message.ip_format_err);
				return false;
			  }
			}

			setServerIP(msg);
			//vscode.window.showInformationMessage("set ip: " + getServerIP())
			vscode.commands.executeCommand('dopi.connect');
		});
	}));
}
let detectTimer:any = undefined;
export function dopi_connect(): vscode.Disposable{
	return (vscode.commands.registerCommand('dopi.connect', (port:string) => {
		//vscode.window.showInformationMessage("Try to connect: " + port)
		//vscode.window.showInformationMessage("Try to connect: " + getServerIP())
		//connectDopi(port);
		let ip:string|undefined = getServerIP();
		if(ip == undefined){
			vscode.commands.executeCommand('dopi.search');
			return;
		}
		connectTelnet(ip);
		MICROPYTHON_STATUS = false;
		vscode.commands.executeCommand('dopi.ui.update');
		if(detectTimer == undefined){
			detectTimer = setInterval(function () {
				if(isConnect()){
					let name = process.platform === 'win32' ? 'telnet.exe' : 'telnet'
					detectProcess(name);
				}
				
			},1000);
		}
	}));
}
export function dopi_disconnect(): vscode.Disposable{
	return (vscode.commands.registerCommand('dopi.disconnect', (port:string) => {
		//vscode.window.showInformationMessage("Try to disconnect: " + port)
		MICROPYTHON_STATUS = false;
		//disconnectDopi(port);
		disconnectTelnet()
		vscode.window.showInformationMessage(language.message.disconnect_successful);
		vscode.commands.executeCommand('dopi.ui.update');
	}));
}
function micropython_comments(txt:string) :string{
	
	// let s = txt?.match(new RegExp(/'''[\s\S]*'''/g))
	// if(s != undefined){
	// 	s.forEach((l, i)=>{
	// 		txt = txt?.replace(l,"")
	// 	});
	// }

	// s = txt?.match(new RegExp(/#.*/g))
	// if(s != undefined){
	// 	s.forEach((l, i)=>{
	// 		txt = txt?.replace(l,"")
	// 	});
	// }
	
	let str = txt.match(/[\u4e00-\u9faf]+/g);
	if(str != undefined){
		str.forEach((l, i)=>{
			txt = txt?.replace(l,"undefined")
		});
	}
	return txt;
}
export function micropython_run(): vscode.Disposable{
	return (vscode.commands.registerCommand('dopi.run', (port:string) => {
		if(!isConnect()){
			vscode.window.showInformationMessage(language.message.connect_hint)
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
			code = micropython_comments(code);
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
export function micropython_install(): vscode.Disposable{
	return (vscode.commands.registerCommand('dopi.micropython_install', (port:string) => {
		//vscode.window.showInformationMessage("Try to disconnect: " + port)
		
		if(!isConnect()){
			vscode.window.showInformationMessage(language.message.connect_hint)
			return;
		}
		if(MICROPYTHON_STATUS){
			vscode.window.showInformationMessage(language.message.program_stop_hint)
			return;
		}
		
		vscode.window.showInputBox(
			{
				password:false,
				ignoreFocusOut:true,
				placeHolder:language.micropython_lib_install.placeHolder,
				prompt:language.micropython_lib_install.prompt

			}
		).then(function(msg){
			//vscode.window.showInformationMessage("msg: " + msg)
			if(msg == undefined) {
				//vscode.window.showInformationMessage("msg is null" )
				return;
			}
			terminal = createTerminal()
			let cmd:string = "micropython -m upip install ".concat(msg)
			terminal.sendText(cmd)
			
		});
	}));
}
export function micropython_stop(): vscode.Disposable{
	return (vscode.commands.registerCommand('dopi.stop', (port:string) => {
		if(!isConnect()){
			vscode.window.showInformationMessage(language.message.connect_hint)
			return;
		}
		if(!MICROPYTHON_STATUS){
			//vscode.window.showInformationMessage(language.message.program_stop_hint)
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
