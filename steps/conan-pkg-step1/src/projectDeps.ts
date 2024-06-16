import * as vscode from 'vscode';

export class DepNode {
    public name?: string;
    public children?: DepNode[] | undefined;
}

export class ProjectDeps implements vscode.TreeDataProvider<DepNode> {
    public viewType = "mo.projectDeps";
    public requires?: DepNode[];
    public buildRequires?: DepNode[];

    public fillDeps(depsJson: any) {
        if (depsJson) {
            this.requires = [];
            this.getDepNode(depsJson, this.requires, "requires");
            this.buildRequires = [];
            this.getDepNode(depsJson, this.buildRequires, "buildRequires");
        }
    }
    private getDepNode(depsJson: any, requires: DepNode[], property: string) {
        for (var pack of depsJson) {
            if (Object.prototype.hasOwnProperty.call(pack, property)) {
                console.log(pack["display_name"], pack[property]);
                let children: { name: string }[] = [];
                for (let item of pack[property]) {
                    children.push({ name: item });
                }
                let requiresItem = { name: pack["display_name"] as string, children: children };
                requires.push(requiresItem);
            }
        }
    }
    public getChildren(element: DepNode): DepNode[] {
        if (element === undefined) {
            return [{ name: "build requires", children: this.buildRequires },
                { name: "requires", children: this.requires },];
        }
        if (element.children) {
            return element.children;
        }
        return [];
    }

    static index: number = 0;
    public getTreeItem(element: DepNode): vscode.TreeItem {
        const treeItem: vscode.TreeItem = {
            label: element.name
        };

        treeItem.id = element.name + ProjectDeps.index.toString();
        ProjectDeps.index++;
        if (element.name?.endsWith("requires")) {
            treeItem.contextValue = "root";
        }
        else {
            treeItem.contextValue = "package";
        }
        treeItem.collapsibleState = element.children ?
            vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
        return treeItem;
    }
}