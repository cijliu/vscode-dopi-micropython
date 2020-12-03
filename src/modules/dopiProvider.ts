/*
 * @Author: cijliu
 * @Date: 2020-11-05 15:11:26
 * @LastEditTime: 2020-12-03 10:58:12
 */
import { TreeDataProvider, Event, TreeItem, TreeItemCollapsibleState, Uri, ProviderResult, EventEmitter } from "vscode";
import * as vscode from 'vscode';
import { join } from 'path';
import {language} from './language';
export class DopiProvider implements TreeDataProvider<DataItem> {
    private _onDidChangeTreeData?: EventEmitter<DataItem | undefined> | undefined = new EventEmitter <DataItem | undefined > ();
    readonly onDidChangeTreeData?: Event < DataItem | null|undefined > = this._onDidChangeTreeData?.event;
    data: DataItem[];
    connect: boolean = false;
    device = new DataItem('Serial');
    run = new DataItem('');
    stop = new DataItem('');
    tutorial = new DataItem('');
    resources_path = join(__dirname, '..','..','resources');
    constructor() {
        this.device.label = language.label.link;
        this.device.contextValue = "Device";
        this.device.iconPath = Uri.file(join(this.resources_path, this.connect?'serial-connect.svg':'serial-disconnect.svg'));
        this.device.command =  { command: 'dopi.search', title: "Connect"};

        this.run.label = language.label.run;
        this.run.contextValue = "Run";
        this.run.iconPath = Uri.file(join(this.resources_path, 'start.svg'));
        this.run.command =  { command: 'dopi.run', title: "Run"};

        this.stop.label = language.label.stop;
        this.stop.contextValue = "Stop";
        this.stop.iconPath = Uri.file(join(this.resources_path, 'stop.svg'));
        this.stop.command =  { command: 'dopi.stop', title: "Stop"};

        this.tutorial.label = language.label.tutorial;
        this.tutorial.contextValue = "Tutorial";
        this.tutorial.iconPath = Uri.file(join(this.resources_path, 'book.svg'));
        this.tutorial.command =  { command: 'dopi.tutorial', title: "Tutorial"};
        this.data = [
            this.device,
            this.run,
            this.stop,
            this.tutorial,
        ];

    }
    update(){
        this.device.iconPath = Uri.file(join(this.resources_path, this.connect?'serial-connect.svg':'serial-disconnect.svg'));
        this._onDidChangeTreeData?.fire();
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