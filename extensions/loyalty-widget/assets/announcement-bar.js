/**
 * Announcement / USP Bar - Auto-rotating messages
 */
(function () {
  "use strict";

  var bar = document.getElementById("announcement-bar-app");
  if (!bar) return;

  var rawMsgs = bar.dataset.messages || "";
  var messages = rawMsgs.split("|||").filter(function (m) { return m.trim(); });
  if (messages.length <= 1) return; // No rotation needed for single message

  var speed = parseInt(bar.dataset.speed) || 4;
  var transition = bar.dataset.transition || "fade";
  var msgEl = bar.querySelector(".ab-message");
  if (!msgEl) return;

  var currentIndex = 0;
  var outClass = "ab-" + transition + "-out";
  var inClass = "ab-" + transition + "-in";
  var enterClass = "ab-" + transition + "-enter";

  setInterval(function () {
    // Animate out
    msgEl.classList.add(outClass);
    msgEl.classList.remove(inClass);

    setTimeout(function () {
      // Change text
      currentIndex = (currentIndex + 1) % messages.length;
      msgEl.textContent = messages[currentIndex];

      // Prep enter position
      if (transition === "slide") {
        msgEl.classList.remove(outClass);
        msgEl.classList.add(enterClass);

        // Force reflow
        void msgEl.offsetHeight;

        // Animate in
        msgEl.classList.remove(enterClass);
        msgEl.classList.add(inClass);
      } else {
        // Fade: just remove out, add in
        msgEl.classList.remove(outClass);
        msgEl.classList.add(inClass);
      }
    }, 400);
  }, speed * 1000);
})();
