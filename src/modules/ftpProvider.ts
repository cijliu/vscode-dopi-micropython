/*
 * @Author: cijliu
 * @Date: 2020-12-02 09:52:43
 * @LastEditTime: 2020-12-04 10:59:31
 */
/*
 * @Author: cijliu
 * @Date: 2020-11-05 15:11:26
 * @LastEditTime: 2020-11-16 17:52:34
 */
import { TreeDataProvider, TreeItem, TreeItemCollapsibleState, ProviderResult, window,Event,EventEmitter,Uri,SaveDialogOptions } from "vscode";
import * as  fs from "fs";
import * as ftp from "ftp";
import { join } from 'path';
import { getServerIP, isConnect } from "./serial";
import { language } from "./language";
//import * as Client from "ftp";

export class FtpProvider implements TreeDataProvider<FtpTreeItem> {
    private _onDidChangeTreeData?: EventEmitter<FtpTreeItem | undefined> | undefined = new EventEmitter <FtpTreeItem | undefined > ();
    readonly onDidChangeTreeData?: Event < FtpTreeItem | null|undefined > = this._onDidChangeTreeData?.event;
    ftp_path:string = "./app/res";
    py_ftp_path:string = "./app/py";
    sync = new FtpTreeItem('','');
    upload = new FtpTreeItem('','');
    resources_path = join(__dirname, '..','..','resources');
    data: FtpTreeItem[] = [];
    private ftp_info ={
        host:"192.168.137.25",
        port:21,
        user:"anonymous",
        password:"anonymous"

    };
    update():void{
        this._onDidChangeTreeData?.fire(undefined);
    }
    list(p:FtpProvider,path:string) {
        let host = getServerIP();
        if(host == undefined){
            window.showInformationMessage(language.message.connect_hint);
            return;
        }
        this.ftp_info.host = host;
        p.data = [p.sync,p.upload];
        let c = new ftp()
        c.on('ready', function() {
            c.list(path,function(err:any, list:ftp.ListingElement[]) {
                if(err) {
                    window.showInformationMessage(language.message.connect_hint);
                    throw err;
                }
                list.forEach(element => {
                    p.data.push(new FtpTreeItem(element.name, path))
                    //console.log(element.type,element.name)
                });
                //console.dir(list);
                p.update();
                c.end();
                c.destroy();
            });

        });
        // connect to localhost:21 as anonymous
        c.connect(this.ftp_info);

    }
    pyfile(p:FtpProvider,buffer:string, save:string){
        let host = getServerIP();
        if(host == undefined){
            window.showInformationMessage(language.message.connect_hint);
            return;
        }
        this.ftp_info.host = host;
        let c = new ftp()
        c.on('ready', function() {
            //console.log("on")
            c.cwd(p.py_ftp_path,function(err,curdir){
                //console.log(err,curdir)
            });
            c.put(buffer,save, function(err) {
                if (err) {
                    //console.log(path,save)
                    window.showInformationMessage(language.ftp.err);
                    throw err;
                }
                //p.list(p,p.py_ftp_path);
                c.end();
              });

        });
        //console.log("err")
        // connect to localhost:21 as anonymous
        c.connect(this.ftp_info);
    }
    put(p:FtpProvider,buffer:string, save:string){
        let host = getServerIP();
        if(host == undefined){
            window.showInformationMessage(language.message.connect_hint);
            return;
        }
        this.ftp_info.host = host;
        let c = new ftp()
        c.on('ready', function() {
            //console.log("on")
            c.cwd(p.ftp_path,function(err,curdir){
                //console.log(err,curdir)
            });
            c.put(buffer,save, function(err) {
                if (err) {
                    //console.log(path,save)
                    window.showInformationMessage(language.ftp.err);
                    throw err;
                }
                p.list(p,p.ftp_path);
                c.end();
              });

        });
        //console.log("err")
        // connect to localhost:21 as anonymous
        c.connect(this.ftp_info);
    }
    constructor(path:string){
        this.ftp_path = path;
        this.data = [
            this.sync,
            this.upload
        ];
        this.sync.label = language.ftp.sync;
        this.sync.contextValue = "FTP";
        this.sync.iconPath = Uri.file(join(this.resources_path, 'sync.svg'));
        this.sync.command = { command: 'dopi.ftp.sync', title: "Connect",arguments:[]};
        //this.sync.command =  { command: 'dopi.search', title: "Connect"};

        this.upload.label = language.ftp.upload;
        this.upload.contextValue = "FTP";
        this.upload.iconPath = Uri.file(join(this.resources_path, 'upload.svg'));
        this.upload.command = { command: 'dopi.ftp.upload', title: "Connect",arguments:[]};
        //this.list(this, path);
    }

    get(path:string, save:string){
        let host = getServerIP();
        if(host == undefined){
            window.showInformationMessage(language.message.connect_hint);
            return;
        }
        this.ftp_info.host = host;
        let c = new ftp()
        c.on('ready', function() {
            c.get(path,function(err, stream){
                if (err){
                    window.showInformationMessage(language.ftp.err);
                    throw err;
                }
                stream.once('close', function() { c.end(); });
                stream.pipe(fs.createWriteStream(save));

            })

        });

        // connect to localhost:21 as anonymous
        c.connect(this.ftp_info);
    }

    getTreeItem(element: FtpTreeItem) : FtpTreeItem | Thenable<FtpTreeItem> {
        return element;
    }

    getChildren(element?: FtpTreeItem | undefined): ProviderResult<FtpTreeItem[]>{
        return this.data;
    }


}


export class FtpTreeItem extends TreeItem{
    constructor(
        public label: string,      //存储当前标签
        public parentPath: string,   //存储当前标签的路径，不包含该标签这个目录
        //public readonly collapsibleState: TreeItemCollapsibleState
    ){
        super(label, TreeItemCollapsibleState.None);
    }

    //为每项添加点击事件的命令
    command = {
        title: "ftp",
        command: 'FtpTreeItem.itemClick',
        arguments: [    //传递两个参数
            this.label,
            this.parentPath.concat("/",this.label)
        ]
    };
    contextValue = 'FtpTreeItem';//提供给 when 使用
}