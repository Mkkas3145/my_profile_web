'use strict';

class MediaLoadingEvent {
    static init(element) {
        let mediaLoading = document.createElement("div");
        mediaLoading.classList.add("media_loading");
        mediaLoading.style.width = "100%";
        mediaLoading.style.height = "100%";
        mediaLoading.style.position = "absolute";
        mediaLoading.style.overflow = "hidden";
        mediaLoading.style.backgroundColor = "#eeeeee";
        mediaLoading.style.transition = "opacity 0.2s";

        let effect = document.createElement("div");
        effect.style.width = "calc(100% / 1.5)";
        effect.style.height = "100%";
        effect.style.position = "absolute";
        effect.style.animation = "mediaLoading 1s infinite";
        effect.style.background = "linear-gradient(to left, transparent, #dddddd, transparent)";

        // 효과 보이게
        mediaLoading.appendChild(effect);
        element.appendChild(mediaLoading);
    }
    static hide(element) {
        element.children[0].offsetHeight; // 강제 리플로우
        element.children[0].style.transform = "scale(1)";
        let mediaLoading = element.getElementsByClassName("media_loading");
        for (let i = 0; i < mediaLoading.length; i++) {
            mediaLoading[i].style.opacity = 0;
        }
    }
}

class MediaLoadingElement extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        // 자식 요소 체크
        if (this.children.length != 1) {
            console.error("media-loading의 자식 요소는 1개이여야 합니다.");
            return;
        }
        // 로딩 효과 제거
        let mediaLoading = this.getElementsByClassName("media_loading");
        for (let i = 0; i < mediaLoading.length; i++) {
            mediaLoading[i].remove();
            i--;
        }
        MediaLoadingEvent.init(this);
        // 이벤트 등록
        for (let i = 0; i < this.children.length; i++) {
            let element = this.children[i];
            element.addEventListener("load", () => {
                MediaLoadingEvent.hide(this);
            });
            element.addEventListener("loadeddata", () => {
                MediaLoadingEvent.hide(this);
            });
            if (element.complete) {
                MediaLoadingEvent.hide(this);
            }
        }
    }
}
window.customElements.define("media-loading", MediaLoadingElement);