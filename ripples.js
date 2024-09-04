'use strict';

class RipplesEvent {
    static option = {
        "spreadDuration": 0.15,                     // 리플 효과가 퍼지는 시간
        "fadeInDuration": 0.05,                     // 리플 효과가 나타나는 시간
        "fadeOutDuration": 0.2,                     // 리플 효과가 끝난 뒤, 사라지는 시간
        "touchDelay": 0.1,                          // 스크롤 동작을 구분하기 위해 기다리는 시간
        "color": "#000000",                         // 리플 효과 색상
        "opacity": 0.5,                             // 리플 효과 불투명도
        "blur": 10,                                 // 리플 효과 흐릿함 정도 (px)
        "lowerScale": 0.2,                          // 시작 시, 진행 상황
        "upperScale": 1,                            // 끝날 시, 진행 상황
        "curve": [0.215, 0.61, 0.355, 1.0]          // 3차원 베지어 곡선
    }

    static getZoom(element) {
        let zoom = 1;
        let currentElement = element;
        while (currentElement) {
            let style = window.getComputedStyle(currentElement);
            let zoomValue = style.zoom;
            if (zoomValue && zoomValue !== 'normal' && zoomValue !== 'auto') {
                zoom *= parseFloat(zoomValue);
            }
            currentElement = currentElement.parentElement;
        }
        return zoom;
    }

    static start(element, x, y) {
        let rect = element.getBoundingClientRect();
        let zoom = this.getZoom(element);

        // 줌 보정
        x /= zoom;
        y /= zoom;

        // 절대 위치를 상대 위치로 계산합니다.
        x -= rect.left;
        y -= rect.top;

        // 터치한 지점을 퍼센트로 계산합니다.
        let percentX = (x / rect.width);
        let percentY = (y / rect.height);
        // 퍼센트(0 ~ 1)로 계산된 것을 -0.5 ~ 0.5 범위로 바꿉니다.
        percentX -= 0.5;
        percentY -= 0.5;
        // -0.5 ~ 0.5 범위로 계산된 것을 -1 ~ 1 범위로 바꿉니다.
        percentX *= 2;
        percentY *= 2;

        // 리플 효과 앨리먼트 생성
        let ripples = document.createElement("div");
        ripples.classList.add("ripples_element_wrap");
        ripples.style.width = "100%";
        ripples.style.height = "100%";
        ripples.style.position = "absolute";
        ripples.style.top = "0px";
        ripples.style.left = "0px";
        ripples.style.zIndex = 2147483647;
        ripples.style.pointerEvents = "none";
        ripples.style.display = "flex";
        ripples.style.justifyContent = "center";
        ripples.style.alignItems = "center";
        ripples.style.overflow = "hidden";
        ripples.style.transition = ("opacity " + this.option["fadeInDuration"] + "s");
        ripples.style.opacity = 0;
        let effect = document.createElement("div");
        effect.classList.add("ripples_element_effect");
        effect.style.backgroundColor = this.option["color"];
        effect.style.borderRadius = "50%";
        effect.style.opacity = this.option["opacity"];
        effect.style.filter = ("blur(" + this.option["blur"] + "px)");
        effect.style.transform = ("scale(" + this.option["lowerScale"] + ")");
        effect.style.transition = ("transform " + this.option["spreadDuration"] + "s, opacity " + this.option["fadeOutDuration"] + "s");
        effect.style.transitionTimingFunction = ("cubic-bezier(" + this.option["curve"].join(", ") + ")");
        
        // 최대 사이즈 구하기 (거리 차이를 이용해서)
        let centerToWidth = Math.abs(rect.width * percentX);
        let centerToHeight = Math.abs(rect.height * percentY);
        let toWidth = (rect.width + centerToWidth);
        let toHeight = (rect.height + centerToHeight);
        let size = this.distanceTo(0, 0, toWidth, toHeight);
        effect.style.minWidth = ((size + (this.option["blur"] * 2)) + "px");
        effect.style.minHeight = ((size + (this.option["blur"] * 2)) + "px");
        // 리플 효과를 터치한 지점으로 이동
        effect.style.marginTop = ((rect.height * percentY) + "px");
        effect.style.marginLeft = ((rect.width * percentX) + "px");

        ripples.appendChild(effect);
        element.appendChild(ripples);

        // 리플 효과 시작
        effect.setAttribute("start_time", new Date().getTime());
        ripples.offsetHeight; // 강제 리플로우
        ripples.style.opacity = 1;
        effect.style.transform = ("scale(" + this.option["upperScale"] + ")");
    }

    static end(element) {
        let endTime = new Date().getTime();
        let wrap = element.getElementsByClassName("ripples_element_wrap");
        for (let i = 0; i < wrap.length; i++) {
            let wrapper = wrap[i];
            let effect = wrapper.children[0];
            let hide = effect.getAttribute("hide");
            if (hide != true && hide != "true") {
                effect.setAttribute("hide", true);

                let startTime = Number.parseInt(effect.getAttribute("start_time"));
                let deltaTime = (endTime - startTime) / 1000;
                let delay = (this.option["spreadDuration"] - deltaTime);
                (delay < 0) ? delay = 0 : null;

                setTimeout(() => {
                    effect.style.opacity = 0;
                    setTimeout(() => {
                        wrapper.remove();
                    }, this.option["fadeOutDuration"] * 1000);
                }, delay * 1000);
            }
        }
    }

    // 거리 차이 구하기
    static distanceTo(x1, y1, x2, y2) {
        let xDistance = (x2 - x1);
        let yDistance = (y2 - y1);
        return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    }
}

class LightHoverEvent {
    static option = {
        "enable": true,             // 호버 효과 사용 여부
        "fadeInDuration": 0.2,      // 호버 효과가 나타나는 시간
        "fadeOutDuration": 0.2,     // 호버 효과가 끝난 뒤, 사라지는 시간
        "color": "#000000",         // 호버 효과 색상
        "opacity": 0.2,             // 호버 효과 불투명도
        "scale": 1                  // 호버 효과 크기
    }

    static start(element, x, y) {
        if (this.option["enable"] == false) { return; }
        let rect = element.getBoundingClientRect();
        let zoom = RipplesEvent.getZoom(element);

        // 줌 보정
        x /= zoom;
        y /= zoom;

        // 절대 위치를 상대 위치로 계산합니다.
        x -= rect.left;
        y -= rect.top;

        // 마우스 지점을 퍼센트로 계산합니다.
        let percentX = (x / rect.width);
        let percentY = (y / rect.height);
        // 퍼센트(0 ~ 1)로 계산된 것을 -0.5 ~ 0.5 범위로 바꿉니다.
        percentX -= 0.5;
        percentY -= 0.5;
        // -0.5 ~ 0.5 범위로 계산된 것을 -1 ~ 1 범위로 바꿉니다.
        percentX *= 2;
        percentY *= 2;

        let wrap = element.getElementsByClassName("light_hover_element_wrap");
        if (wrap.length == 0) {
            // 호버 효과 앨리먼트 생성
            let lightHover = document.createElement("div");
            lightHover.classList.add("light_hover_element_wrap");
            lightHover.style.width = "100%";
            lightHover.style.height = "100%";
            lightHover.style.position = "absolute";
            lightHover.style.top = "0px";
            lightHover.style.left = "0px";
            lightHover.style.zIndex = 2147483647;
            lightHover.style.pointerEvents = "none";
            lightHover.style.display = "flex";
            lightHover.style.justifyContent = "center";
            lightHover.style.alignItems = "center";
            lightHover.style.overflow = "hidden";
            lightHover.style.transition = ("opacity " + this.option["fadeInDuration"] + "s");
            lightHover.style.opacity = 0;
            let effect = document.createElement("div");
            effect.classList.add("light_hover_element_effect");
            effect.style.backgroundColor = this.option["color"];
            effect.style.maskImage = "radial-gradient(circle, white 0%, transparent 70%)";
            effect.style.borderRadius = "50%";
            effect.style.opacity = this.option["opacity"];
            effect.style.transform = ("scale(" + this.option["scale"] + ")");
            
            // 최대 사이즈 구하기 (거리 차이를 이용해서)
            let centerToWidth = Math.abs(rect.width * percentX);
            let centerToHeight = Math.abs(rect.height * percentY);
            let toWidth = (rect.width + centerToWidth);
            let toHeight = (rect.height + centerToHeight);
            let size = this.distanceTo(0, 0, toWidth, toHeight);
            effect.style.minWidth = (size + "px");
            effect.style.minHeight = (size + "px");
            // 호버 효과를 마우스 지점으로 이동
            effect.style.marginTop = ((rect.height * percentY) + "px");
            effect.style.marginLeft = ((rect.width * percentX) + "px");

            lightHover.appendChild(effect);
            element.appendChild(lightHover);

            // 호버 효과 나타나기
            lightHover.offsetHeight; // 강제 리플로우
            lightHover.style.opacity = 1;
        } else {
            let effect = wrap[0].children[0];
            // 최대 사이즈 구하기 (거리 차이를 이용해서)
            let centerToWidth = Math.abs(rect.width * percentX);
            let centerToHeight = Math.abs(rect.height * percentY);
            let toWidth = (rect.width + centerToWidth);
            let toHeight = (rect.height + centerToHeight);
            let size = this.distanceTo(0, 0, toWidth, toHeight);
            effect.style.minWidth = (size + "px");
            effect.style.minHeight = (size + "px");
            // 호버 효과를 터치한 지점으로 이동
            effect.style.marginTop = ((rect.height * percentY) + "px");
            effect.style.marginLeft = ((rect.width * percentX) + "px");
            wrap[0].style.transition = ("opacity " + this.option["fadeOutDuration"] + "s");
            wrap[0].style.opacity = 1;
        }
    }

    static end(element) {
        let wrap = element.getElementsByClassName("light_hover_element_wrap");
        if (wrap.length != 0) {
            wrap[0].style.opacity = 0;
        }
    }
    
    // 거리 차이 구하기
    static distanceTo(x1, y1, x2, y2) {
        let xDistance = (x2 - x1);
        let yDistance = (y2 - y1);
        return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    }
}

class RipplesElement extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        // 자식 요소 체크
        if (this.children.length != 1) {
            console.error("ripples-element의 자식 요소는 1개이여야 합니다.");
            return;
        }
        // 리플 효과 제거
        let wrap = this.getElementsByClassName("ripples_element_wrap");
        for (let i = 0; i < wrap.length; i++) {
            wrap[i].remove();
            i--;
        }
        // 호버 효과 제거
        wrap = this.getElementsByClassName("light_hover_element_wrap");
        for (let i = 0; i < wrap.length; i++) {
            wrap[i].remove();
            i--;
        }
        let child = this.children[0];
        // 이벤트 등록 - 클릭
        child.addEventListener("mousedown", (event) => {
            if (!isTouch) {
                RipplesEvent.start(child, event.clientX, event.clientY);
            } else {
                isTouch = false;
            }
        });
        child.addEventListener("mouseup", () => {
            RipplesEvent.end(child);
        });
        child.addEventListener("mouseleave", () => {
            RipplesEvent.end(child);
        });
        // 이벤트 등록 - 마우스 이동
        let isTouch_mousemove = false;
        child.addEventListener("mousemove", (event) => {
            if (!isTouch_mousemove) {
                LightHoverEvent.start(child, event.clientX, event.clientY);
            } else {
                isTouch_mousemove = false;
            }
        });
        child.addEventListener("mouseleave", () => {
            LightHoverEvent.end(child);
        });
        // 이벤트 등록 - 터치
        let isTouch = false;
        let touchTimeout = null;
        let touchStartEvent = null;
        child.addEventListener("touchstart", (event) => {
            isTouch = true;
            isTouch_mousemove = true;
            touchStartEvent = event;
            touchStart(event, RipplesEvent.option["touchDelay"]);
        }, {passive: true});
        child.addEventListener("touchend", () => {
            RipplesEvent.end(child);
            if (touchStartEvent != null) {
                touchStart(touchStartEvent, 0);
            }
        }, {passive: true});
        child.addEventListener("touchcancel", () => {
            touchCancel();
        }, {passive: true});
        child.addEventListener("touchmove", () => {
            touchCancel();
        }, {passive: true});
        function touchCancel() {
            if (touchTimeout != null) {
                clearTimeout(touchTimeout);
                touchTimeout = null;
                touchStartEvent = null;
            }
            RipplesEvent.end(child);
        }
        function touchStart(event, waitTime) {
            if (touchTimeout != null) {
                clearTimeout(touchTimeout);
                touchTimeout = null;
                touchStartEvent = null;
            }
            touchTimeout = setTimeout(() => {
                RipplesEvent.start(child, event.touches[0].clientX, event.touches[0].clientY);
                touchTimeout = null;
                touchStartEvent = null;
            }, waitTime * 1000);
        }
    }
}
window.customElements.define("ripples-element", RipplesElement);

(() => {
    // 스타일 적용
    let style = document.createElement('style');
    style.appendChild(document.createTextNode(`
        ripples-element {
            position: relative;
        }
        ripples-element > * {
            position: relative;
            overflow: hidden;
        }
    `));
    document.head.appendChild(style);
    // 메타 태그 수정
    let isMetaTag = false;
    let metaTags = document.head.getElementsByTagName('meta');
    for (let i = 0; i < metaTags.length; i++) {
        let metaTag = metaTags[i];
        if (metaTag.getAttribute('name') === 'viewport') {
            let content = metaTag.getAttribute("content");
            let keyValuePairs = content.split(',');
            let values = keyValuePairs.map(pair => {
                let [key, value] = pair.split('=');
                key = key.trim();
                value = value.trim();
                return {key, value};
            });
            function setValue(key, value) {
                for (let i = 0; i < values.length; i++) {
                    if (values[i]["key"] == key) {
                        values[i]["value"] = value;
                        break;
                    }
                }
                values.push({
                    "key": key,
                    "value": value
                });
            }
            setValue("initial-scale", "1.0");
            setValue("user-scalable", "no");
            let pairs = values.map(pair => `${pair.key}=${pair.value}`);
            metaTag.setAttribute("content", pairs.join(', '));
            isMetaTag = true;
            break;
        }
    }
    // 메타 태그가 없으면 추가
    if (!isMetaTag) {
        let meta = document.createElement('meta');
        meta.setAttribute("name", "viewport");
        meta.setAttribute("content", "initial-scale=1.0, user-scalable=no");
        document.head.appendChild(meta);
    }
})();
