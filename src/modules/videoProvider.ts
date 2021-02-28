/*
 * @Author: cijliu
 * @Date: 2020-12-03 17:09:52
 * @LastEditTime: 2020-12-04 15:41:31
 */
import * as vscode from 'vscode';
import { window } from 'vscode';
import { getWebViewContent } from './dopiUI';
import { language } from './language';
import * as ftp from "ftp";
import * as  fs from "fs";
import * as path from 'path';
import { createTerminal, getServerIP, GetStopCodeFormat, isConnect } from './serial';
import { join } from 'path';
import { exec } from 'child_process';
function getYUVCommand():string {
	let cmd:string = '';
	let yuvtool_root_path: string = path.join(__dirname, '..', '..', 'resources','telnet').replace(/\\/g, "/");
	let yuv_root_path: string = path.join(__dirname, '..', '..', 'resources').replace(/\\/g, "/");
	cmd = yuvtool_root_path + "/yuv.exe " + yuv_root_path + "/image.yuv "+ yuv_root_path + "/out.bmp 320 240";

	return cmd;
}
//var tick:number = 0;
export class VideoViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'Dopi-preview-node';
	private _view?: vscode.WebviewView;
    private _context: vscode.ExtensionContext;
    private videoTimer:NodeJS.Timeout|undefined = undefined;
    private ftp_info ={
        host:"192.168.137.25",
        port:21,
        user:"anonymous",
        password:"anonymous"

    };
	constructor(
		private readonly _extensionUri: vscode.Uri,
		context: vscode.ExtensionContext
	) {
		this._context = context;
		fs.copyFileSync(join(__dirname, '..','..','resources','dopi.jpg'), join(__dirname, '..','..','resources','image.bmp'));
        if(this.videoTimer === undefined){
			this.videoTimer = setInterval(function (p:VideoViewProvider) {
				p.get_image("./app/mem/image.yuv");
			},200,this);
		}
	}
    private get_image(path:string){
		let yuv_path = join(__dirname, '..','..','resources','image.yuv');
		let image_path = join(__dirname, '..','..','resources','image.bmp');
		let out_path = join(__dirname, '..','..','resources','out.bmp');
		let dopi_path = join(__dirname, '..','..','resources','dopi.jpg');
        let host = getServerIP();
        if(host === undefined){
			fs.copyFileSync(dopi_path, image_path);
            return;
        }
        this.ftp_info.host = host;
		let c = new ftp();
        c.on('ready', function() {
            console.log("get image");
			//window.showInformationMessage("get image:", tick.toString());
			//tick = tick + 1;
            c.get(path,function(err, stream){
                if (err){
					//console.log("get fail");
                    if(!isConnect()){
                        fs.copyFileSync(dopi_path, image_path);
                    }
                    c.end();
					c.destroy();
                    return;
                    //throw err;
                }
                stream.once('close', function() {  });
				fs.access(yuv_path, fs.constants.R_OK | fs.constants.W_OK, (err) => {
					if (err){
						//console.log("%s doesn't exist", yuv_path);
						if(err.code === "EPERM"){
							fs.unlink(yuv_path,err=>{
								if(err){
									console.log(err);
								}
							});
						}
					}
				});
				stream.pipe(fs.createWriteStream(yuv_path));
				stream.on("end", ()=>{
					exec(getYUVCommand(),
						{ encoding: "binary" },
						function(error, stdout, stderr) {
							if(error && err !== undefined){
								//console.log('failed:',err);
								return;
							}
							fs.copyFileSync(out_path, image_path);
							c.delete(path,function(err){
								if (err){
									//console.log("del fail");
									c.end();
									return;//throw err;
								}
								//console.log("del success");
								c.end();
							});

						}
					);

				});


            });


        });

        // connect to localhost:21 as anonymous
        c.connect(this.ftp_info);
    }
	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
			}
		});
	}



	private _getHtmlForWebview(webview: vscode.Webview) {
		return getWebViewContent(this._context,'resources/video.html' );
	}
}

