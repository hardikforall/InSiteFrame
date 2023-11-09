(function () {
  var InSiteFrame = {

    init: function () {
      this.bindEvents();
    },

    bindEvents: function () {
        const selector = 'a[target="_blank"][href^="https:"]:not([data-skip-iframe]), a[href^="https:"][data-force-iframe]';
      document.querySelectorAll(selector).forEach((link) => {
        link.addEventListener("click", this.handleLinkClick.bind(this));
      });
    },

    handleLinkClick: function (e) {
      e.preventDefault();
      var href = e.currentTarget.href;
      var title = e.currentTarget.getAttribute("data-title");
      var anchorContent = e.currentTarget.textContent.trim();
      var iframeTitle = anchorContent || title;
      this.createIframe(href, iframeTitle);
    },

    createIframe: function (href, title) {
      var iframeContainer = this.getOrCreateContainer();
      iframeContainer.innerHTML = ""; // Clear any existing content

      var titleBar = this.createTitleBar(href, title, iframeContainer);
      iframeContainer.appendChild(titleBar);

      var iframe = this.createIframeElement(href, title, iframeContainer);
      iframeContainer.appendChild(iframe);

      iframeContainer.offsetHeight; // Trigger reflow/repaint
      iframeContainer.classList.add("active"); // Make the iframe container visible
      this.toggleBackdrop(true);
    },

    getOrCreateContainer: function () {
      var iframeContainer = document.getElementById("isf-iframe-container");
      if (!iframeContainer) {
        iframeContainer = document.createElement("div");
        iframeContainer.id = "isf-iframe-container";
        document.body.appendChild(iframeContainer);
      }
      return iframeContainer;
    },
    truncateURL: function (url, maxLength) {
      if (url.length <= maxLength) {
        return url;
      }
      return url.substr(0, maxLength) + "…"; // Ellipsis to indicate truncation
    },

    createTitleBar: function (href, title, iframeContainer) {
      var titleBar = document.createElement("div");
      titleBar.className = "title-bar";

      var titleWrapper = document.createElement("div");
      titleWrapper.className = "titleWrapper";

      // Create the lock icon
      var lockIcon = document.createElement("span");
      lockIcon.className = "lock-icon";
      lockIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 10V8C17 5.23858 14.7614 3 12 3C9.23858 3 7 5.23858 7 8V10M12 14.5V16.5M8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C17.7202 10 16.8802 10 15.2 10H8.8C7.11984 10 6.27976 10 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`; 
      titleBar.appendChild(lockIcon);

      // Create the title span
      var titleSpan = document.createElement("span");
      titleSpan.className = "title";
      titleSpan.textContent = title || "Loading...";
      titleWrapper.appendChild(titleSpan);

      // Create the URL span
      var urlSpan = document.createElement("span");
      urlSpan.className = "url";
      urlSpan.textContent = this.truncateURL(href, 100); // Truncate URL if longer than 50 chars
      titleWrapper.appendChild(urlSpan);

      titleBar.appendChild(titleWrapper);

      titleBar.appendChild(
        this.createButton(
          `<svg  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9L19 17C19 18.8856 19 19.8284 18.4142 20.4142C17.8284 21 16.8856 21 15 21L14 21L10 21L9 21C7.11438 21 6.17157 21 5.58579 20.4142C5 19.8284 5 18.8856 5 17L5 9" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M3 11L7.5 7L10.6713 4.18109C11.429 3.50752 12.571 3.50752 13.3287 4.18109L16.5 7L21 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 21V17C10 15.8954 10.8954 15 12 15V15C13.1046 15 14 15.8954 14 17V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          `,
          function () {
            var iframe = iframeContainer.querySelector("iframe");
            if (iframe) {
              var src = iframe.src;
              iframe.src = ""; // Reset src to ensure reload
              iframe.onload = function () {
                iframe.src = src;
              };
            }
          }
        )
      );

      titleBar.appendChild(
        this.createButton(
          `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Arrow / Arrow_Circle_Up_Right"><path id="Vector" d="M15 13V9M15 9H11M15 9L9 15M21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`,
          function () {
            window.open(href, "_blank").focus();
          }
        )
      );
      titleBar.appendChild(
        this.createButton(`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path id="Vector" d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`, this.closeIframe.bind(this))
      );

      return titleBar;
    },

    createIframeElement: function (href, titleAttr, iframeContainer) {
      var iframe = document.createElement("iframe");
      iframe.onload = function () {
        var titleSpan = iframeContainer.querySelector(".title");
        titleSpan.textContent = titleAttr || "Untitled";
      };
      iframe.src = href;
      return iframe;
    },

    createButton: function (text, onClick) {
      var button = document.createElement("button");
      button.className = "iframe-button";
      button.innerHTML = text;
      button.onclick = onClick;
      return button;
    },

    closeIframe: function () {
      var iframeContainer = document.getElementById("isf-iframe-container");
      iframeContainer.classList.remove("active");
      setTimeout(() => {
        iframeContainer.innerHTML = ""; 
      }, 500); 
      this.toggleBackdrop(false);
    },

    toggleBackdrop: function (show) {
      var backdrop = document.getElementById("isf-backdrop");
      if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.id = "isf-backdrop";
        backdrop.onclick = this.closeIframe.bind(this);
        document.body.appendChild(backdrop);
      }
      backdrop.style.display = show ? "block" : "none";
      document.documentElement.classList.toggle("no-scroll", show);
      document.body.classList.toggle("no-scroll", show);
    },
  };

  document.addEventListener("DOMContentLoaded", function () {
    InSiteFrame.init();
  });

})();
