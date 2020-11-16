/*
 * @Author: cijliu
 * @Date: 2020-11-05 15:11:26
 * @LastEditTime: 2020-11-16 15:36:01
 */
import { TreeDataProvider, Event, TreeItem, TreeItemCollapsibleState, Uri, ProviderResult } from "vscode";
import * as vscode from 'vscode';
import { join } from 'path';

export class DopiProvider implements TreeDataProvider<DataItem> {
    onDidChangeTreeData?: Event<DataItem | null | undefined> | undefined;

    data: DataItem[];
    connect: boolean = false;
    device = new DataItem('Serial');
    run = new DataItem('');
    stop = new DataItem('');
    resources_path = join(__dirname, '..','..','resources');
    constructor() {
        this.device.label = 'Click to connect telnet';
        this.device.contextValue = "Device";
        this.device.iconPath = Uri.file(join(this.resources_path, this.connect?'serial-connect.svg':'serial-disconnect.svg'));
        this.device.command =  { command: 'dopi.search', title: "Connect"};

        this.run.label = 'Run';
        this.run.contextValue = "Run";
        this.run.iconPath = Uri.file(join(this.resources_path, 'start.svg'));
        this.run.command =  { command: 'dopi.run', title: "Run"};

        this.stop.label = 'Stop';
        this.stop.contextValue = "Stop";
        this.stop.iconPath = Uri.file(join(this.resources_path, 'stop.svg'));
        this.stop.command =  { command: 'dopi.stop', title: "Stop"};
        this.data = [
            this.device,
            this.run,
            this.stop,
        ];

    }
    update(){
        this.device.iconPath = Uri.file(join(this.resources_path, this.connect?'serial-connect.svg':'serial-disconnect.svg'));
        
    }
    getTreeItem(element: DataItem): TreeItem | Thenable<TreeItem> {
        return element;
    }

    getChildren(element?: DataItem | undefined): ProviderResult<DataItem[]> {
        if (element === undefined) {
            return this.data;
        }

        return element.children;
    }
}


class DataItem extends TreeItem{
    public children: DataItem[] | undefined;

    constructor(label: string, children?: DataItem[] | undefined) {
        super(label, children === undefined ? TreeItemCollapsibleState.None : TreeItemCollapsibleState.Collapsed);
        this.children = children;

    }

}