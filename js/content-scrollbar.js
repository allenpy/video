

(function () {
    if (window.nimbusScrollBarWidth) return false;
    window.nimbusScrollBarWidth = true;
    let z = window.devicePixelRatio;
    let totalWidth = [], totalHeight = [];

    let getScrollbarWidth = function () {
        let width = 18;
        try {
            let inner = document.createElement('p');
            inner.style.width = "100%";
            inner.style.height = "200px";
            inner.style.display = "block";

            let outer = document.createElement('div');
            outer.style.position = "absolute";
            outer.style.top = "0px";
            outer.style.left = "0px";
            outer.style.visibility = "hidden";
            outer.style.width = "200px";
            outer.style.height = "150px";
            outer.style.overflow = "hidden";
            outer.appendChild(inner);

            document.body.appendChild(outer);
            let w1 = inner.offsetWidth;
            outer.style.overflow = 'scroll';
            let w2 = inner.offsetWidth;
            if (w1 === w2) w2 = outer.clientWidth;

            document.body.removeChild(outer);

            width = (w1 - w2) * z;
        } catch (e) {
            console.log(e)
        }
        return width;
    };

    const body = document.body;
    const html = document.documentElement;


    if (html && html.clientWidth) totalWidth.push(html.clientWidth);
    if (html && html.scrollWidth) totalWidth.push(html.scrollWidth);
    if (html && html.offsetWidth) totalWidth.push(html.offsetWidth);
    if (body && body.offsetWidth) totalWidth.push(body.offsetWidth);

    if (html && html.clientHeight) totalHeight.push(html.clientHeight);
    if (html && html.scrollHeight) totalHeight.push(html.scrollHeight);
    if (html && html.offsetHeight) totalHeight.push(html.offsetHeight);
    if (body && body.offsetHeight) totalHeight.push(body.offsetHeight);

    totalWidth = Math.max.apply(null, totalWidth);
    totalHeight = Math.max.apply(null, totalHeight);

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const scrollWidth = getScrollbarWidth();
    const hasHScroll = (totalWidth > windowWidth);
    const hasVScroll = (totalHeight > windowHeight);

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.operation === 'get_scrollbar_data') sendResponse({scrollWidth: scrollWidth, hasHScroll: hasHScroll, hasVScroll: hasVScroll});
        return true;
    });
})();

