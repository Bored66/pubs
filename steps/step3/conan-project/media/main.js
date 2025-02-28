(function () {
    const vscode = acquireVsCodeApi();
    
    function sendLog(msg) {
        vscode.postMessage({ name: 'log', value: msg });
    }

    sendLog('Start view/panel: begin' );

    fields = [];
    fields = addFields('input', fields);
    fields = addFields('select', fields);

    fields.forEach(element => {
        const elementIt = document.getElementById(element);
        if (elementIt) {
            if (elementIt.type === 'checkbox') {
                elementIt.addEventListener('change', () => {
                    fieldChecked(element);
                });
            }
            else if (elementIt.type === 'button') {
                elementIt.addEventListener('click', () => {
                    vscode.postMessage({ name: element, value: true });
                });
            }
            else {
                elementIt.addEventListener('change', () => {
                    fieldChanged(element);
                });
            }
            sendLog(`Handler for ${element} is set OK`);
        }
        else {
            sendLog(`Handler for ${element} NOT set`);
        }
    });
    sendLog('Start view/panel: end');


    function fieldChecked(name) {
        vscode.postMessage({ name: name, value: document.getElementById(name).checked });
    }

    function fieldChanged(name) {
        vscode.postMessage({ name: name, value: document.getElementById(name).value });
    }

    window.addEventListener('message', event => {
        const message = event.data;
        const element = document.getElementById(message.name);
        if (message.name === 'status') {
            element.innerHTML = message.value;
            console.log(element.innerHTML + " status");
        }
        else if (element) {
            element.value = message.value;
            console.log('Set ' + message.name + ' to ' + element.value);
        }
        else {
            console.log(element + " not found");
        }
    });

    function addFields(tagName, fields) {
        inputMap = document.getElementsByTagName(tagName);
        for (i = 0; i < inputMap.length; i++) {
            fields.push(inputMap[i].id);
        }
        return fields;
    }
    
})();

