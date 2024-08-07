"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectDeps = exports.DepNode = void 0;
const vscode = require("vscode");
class DepNode {
}
exports.DepNode = DepNode;
class ProjectDeps {
    constructor() {
        this.viewType = "mo.projectDeps";
    }
    fillDeps(depsJson) {
        if (depsJson) {
            this.requires = [];
            this.getDepNode(depsJson, this.requires, "requires");
            this.buildRequires = [];
            this.getDepNode(depsJson, this.buildRequires, "buildRequires");
        }
    }
    getDepNode(depsJson, requires, property) {
        for (var pack of depsJson) {
            if (Object.prototype.hasOwnProperty.call(pack, property)) {
                console.log(pack["display_name"], pack[property]);
                let children = [];
                for (let item of pack[property]) {
                    children.push({ name: item });
                }
                let requiresItem = { name: pack["display_name"], children: children };
                requires.push(requiresItem);
            }
        }
    }
    getChildren(element) {
        if (element === undefined) {
            return [{ name: "build requires", children: this.buildRequires },
                { name: "requires", children: this.requires },];
        }
        if (element.children) {
            return element.children;
        }
        return [];
    }
    getTreeItem(element) {
        const treeItem = {
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
exports.ProjectDeps = ProjectDeps;
ProjectDeps.index = 0;
//# sourceMappingURL=projectDeps.js.map