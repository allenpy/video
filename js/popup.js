window.is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
window.is_chrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor) && !/OPR/.test(navigator.userAgent);
window.is_opera = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor) && /OPR/.test(navigator.userAgent);
window.is_edge = navigator.userAgent.indexOf("Edge") > -1;

const main_menu_item = JSON.parse(localStorage.mainMenuItem);
console.log(localStorage.mainMenuItem);
let t = null;


$('#capture_options').hide();
$('#record_status').hide();

function setOption(key, value) {
    console.log('3333333');
    if (window.is_chrome) return;
    chrome.runtime.sendMessage({operation: 'set_option', key: key, value: value});
}

function checkRecord() {
    chrome.runtime.sendMessage({operation: 'get_info_record'}, function (res) {
        if (res.status) {
            showTime(res.time);
            showRecordStatus();
        } else {
            showCaptureOptions();
            clearTimeout(t)
        }
        t = setTimeout(checkRecord, 500);
    });
}

function showCaptureOptions() {
    $('#capture_options').show();
    $('#record_status').hide();

    $('body').removeClass('resize');
}

function showRecordStatus() {
    $('#capture_options').hide();
    $('#record_status').show();

    $('body').addClass('resize');
}

function showTime(date) {
    let time = new Date(date),
        m = time.getUTCMonth(),
        d = time.getUTCDate() - 1,
        h = time.getUTCHours(),
        M = time.getUTCMinutes(),
        s = time.getUTCSeconds(),
        time_str = '';
    if (m > 0) time_str += ('0' + y).slice(-2) + ':';
    if (d > 0) time_str += ('0' + d).slice(-2) + ':';
    if (h > 0) time_str += ('0' + h).slice(-2) + ':';
    time_str += ('0' + M).slice(-2) + ':';
    time_str += ('0' + s).slice(-2);

    $('#record_time').text(time_str);
}

function handleError(error) {
    console.log('navigator.getUserMedia error: ', error);
}

function setDevices(devices) {
    let $camera = $('select[name=selected-video-camera]');
    let $microphone = $('select[name=selected-microphone]');
    let mic_is = false, cam_is = false;

    for (let i = 0; i !== devices.length; ++i) {
        const device = devices[i];
        let $option = $('<option>').val(device.deviceId);
        if (device.kind === 'audioinput') {
            if (localStorage.selectedMicrophone === device.deviceId) {
                $option.attr('selected', 'selected');
                mic_is = true;
            }
            $microphone.append($option.text(device.label));
        } else if (device.kind === 'videoinput') {
            if (localStorage.selectedVideoCamera === device.deviceId) {
                $option.attr('selected', 'selected');
                cam_is = true;
            }
            $camera.append($option.text(device.label));
        } else {
            console.log('Some other kind of source/device: ', device);
        }
    }

    if (!mic_is) localStorage.removeItem('selectedMicrophone');
    if (!cam_is) localStorage.removeItem('selectedVideoCamera');
}

$(document).ready(function () {
    $("button").on('click', function () {
        switch (this.name) {
            case 'record-start':
                value = 'tab';
                localStorage.tabSound = 'true';
                chrome.runtime.sendMessage({operation: 'activate_record', 'key': 'start', 'value': value});
                setOption('tabSound', localStorage.tabSound);
                break;
            case 'record-stop':
                chrome.runtime.sendMessage({operation: 'activate_record', 'key': 'stop'});
                break;
        }
        if ($(this).data('closeWindow')) {
            window.close();
        }
    });

    navigator.mediaDevices.enumerateDevices().then(setDevices).catch(handleError);

    for (let key in main_menu_item) {
        if (!main_menu_item[key]) {
            $('button[name=\'capture-' + key + '\']').hide()
        }
    }

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        console.log('request', request);
        if (request.operation === 'check_tab_action' && request.action === 'back_is_page') {
            const actions = JSON.parse(request.value);
            let $nsc_button_main = $('.nsc-button-main');

            if (actions.chrome) $nsc_button_main.not('[name=capture-window], [name=capture-blank], [name=nimbus-capture-desktop]').attr('disabled', 'disabled').css({opacity: 0.7});
            if (actions.fragment) $nsc_button_main.attr('disabled', 'disabled').not('[name=capture-fragment]').css({opacity: 0.7});
            if (actions.crop) $nsc_button_main.attr('disabled', 'disabled').not('[name=capture-area]').css({opacity: 0.7});
            if (actions.scroll_crop) $nsc_button_main.attr('disabled', 'disabled').not('[name=capture-scroll]').css({opacity: 0.7});

            if (localStorage.quickCapture !== 'false') {
                $('button[name=\'capture-' + localStorage.quickCaptureType + '\']').click();
            }
        }
    });

    // chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
    //     chrome.runtime.sendMessage({operation: 'u_check','url': tabs[0].url,'tab_id': tabs[0].id});
    // });

    chrome.runtime.sendMessage({operation: 'check_tab_action', 'action': 'insert_page'});

    if (window.is_chrome) {
        chrome.runtime.sendMessage({operation: 'get_info_record'}, function (res) {
            if (res.status) checkRecord();
            else showCaptureOptions();

            $('button[name=record-pause] .nsc-button-layout').text(res.state === 'recording' ? chrome.i18n.getMessage("popupBtnStopPause") : chrome.i18n.getMessage("popupBtnStopResume"));
        });
    }
});
