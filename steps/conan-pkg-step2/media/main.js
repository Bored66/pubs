// https://github.com/microsoft/vscode-extension-samples/blob/main/webview-view-sample/media/main.js
(function () {
    const vscode = acquireVsCodeApi();

    vscode.postMessage({ type: 'Start save settings view/panel', value: 'begin' });

    window.addEventListener('message', event => {
        const message = event.data;
        const element = document.getElementById(message.type);
        if (message.type === 'status') {
            element.innerHTML = message.value;
            console.log(element.innerHTML + " status");
        }
        else if (element) {
            element.value = message.value;
            console.log('Set ' + message.type + ' ' + element.value);
        }
        else {
            console.log(element + " not found");
        }
    });
    if (document.getElementById('Create')) {
        document.getElementById('Create').addEventListener('click', () => {
            createProjectClicked();
        });
    }
    if (document.getElementById('selectFolder')) {
        document.getElementById('selectFolder').addEventListener('click', () => {
            selectFolderClicked('projectPath');
        });
    }
    fields = ['name', 'project_type', 'build_type', 'tsnative_version', 'conan_profile', 'conan_profile_host', 'conan_profile_build'];

    if (Array.isArray(replace_fields)) {
        fields = replace_fields;
    }

    fields.forEach(element => {
        const elementIt = document.getElementById(element);
        if (elementIt) {
            elementIt.addEventListener('change', () => {
                fieldChanged(element);
            });
            // sendLog('set handler for ' + element + ' OK');
        }
    });
    vscode.postMessage({ type: 'Start save settings view/panel', value: 'end' });
    function setClickHandler(id) {
        if (document.getElementById(id)) {
            document.getElementById(id).addEventListener('click', () => {
                createProjectClicked();
            });
        }
    }
    function createProjectClicked() {
        vscode.postMessage({ type: 'Create project', value: 1 });
    }
    function selectFolderClicked(value) {
        vscode.postMessage({ type: 'Select folder', value: value });
    }

    function fieldChanged(name) {
        vscode.postMessage({ type: name, value: document.getElementById(name).value });
    }
    function sendLog(msg) {
        vscode.postMessage({ type: 'log', value: msg });
    }
})();
