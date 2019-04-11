
if (!window.EXT_HOTKEY_JS_INSERTED) {
    window.EXT_HOTKEY_JS_INSERTED = true;

    chrome.runtime.sendMessage({operation: 'get_hotkeys'}, function (response) {
        let hotkeys = JSON.parse(response.hotkeys);

        function sendToChrome(type) {
            chrome.runtime.sendMessage({operation: 'activate_hotkey', value: type});
        }

        window.addEventListener('keydown', function (e) {
            const k = e.keyCode;
            if (e.shiftKey && e.ctrlKey) {
                if (k === +hotkeys.entire) sendToChrome('entire');
                if (k === +hotkeys.fragment) sendToChrome('fragment');
                if (k === +hotkeys.selected) sendToChrome('selected');
                if (k === +hotkeys.scroll) sendToChrome('scroll');
                if (k === +hotkeys.visible) sendToChrome('visible');
                if (k === +hotkeys.window) sendToChrome('window');
            }
        }, false);
    });
    chrome.runtime.sendMessage({operation: 'notice'});

    var button_start = document.getElementById("button_start");
    var button_stop = document.getElementById("button_stop");
    button_start.addEventListener("click", function () {
        // var url = chrome.runtime.getURL("popup.html");
        // alert(url);
        // window.open(url);

        chrome.runtime.sendMessage({operation: "check_tab_action", action: "insert_page"});
        chrome.runtime.sendMessage({operation: "get_info_record"});
        //
        chrome.runtime.sendMessage({operation: 'activate_record', 'key': 'start', 'value': 'tab'});
        chrome.runtime.sendMessage({operation: 'set_option', key: 'tabSound', value: 'true'});

        // chrome.runtime.sendMessage({operation: 'start_video'});

        // chrome.runtime.sendMessage({operation: 'open_window'});
    }, false);
    button_stop.addEventListener("click", function () {
        chrome.runtime.sendMessage({operation: 'activate_record', 'key': 'stop'});

        // chrome.runtime.sendMessage({operation: 'stop_video'});
    }, false);
}
