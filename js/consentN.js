

chrome.runtime.sendMessage({'operation': 'check_tab_action', 'action': 'back_is_page', 'value': JSON.stringify({chrome: false, fragment: window.thisFragment, crop: window.thisCrop, scroll_crop: window.thisScrollCrop})});