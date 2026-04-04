/**
 * Back-in-Stock Alerts - Form submission
 */
(function () {
  "use strict";

  var container = document.getElementById("bis-notify-form");
  if (!container) return;

  var productId = container.dataset.productId;
  var productTitle = container.dataset.productTitle;
  var variantId = container.dataset.variantId;
  var variantTitle = container.dataset.variantTitle;

  var btn = container.querySelector('[data-action="bis-submit"]');
  var emailInput = container.querySelector(".bis-email");
  var successEl = container.querySelector(".bis-success");
  var errorEl = container.querySelector(".bis-error");
  var formEl = container.querySelector(".bis-form");

  if (!btn || !emailInput) return;

  btn.addEventListener("click", function () {
    var email = emailInput.value.trim();
    if (!email || !email.includes("@")) {
      errorEl.textContent = "Please enter a valid email address.";
      errorEl.style.display = "block";
      return;
    }

    btn.disabled = true;
    btn.textContent = "Submitting...";
    errorEl.style.display = "none";

    var url = "/apps/loyalty/stock-subscribe" +
      "?email=" + encodeURIComponent(email) +
      "&productId=" + encodeURIComponent(productId) +
      "&variantId=" + encodeURIComponent(variantId) +
      "&productTitle=" + encodeURIComponent(productTitle) +
      "&variantTitle=" + encodeURIComponent(variantTitle) +
      "&action=stock-subscribe";

    fetch(url)
      .then(function (r) {
        var ct = r.headers.get("content-type") || "";
        if (!ct.includes("application/json")) throw new Error("Not JSON");
        return r.json();
      })
      .then(function (data) {
        if (data.success) {
          formEl.style.display = "none";
          successEl.style.display = "block";
        } else {
          errorEl.textContent = data.error || "Something went wrong.";
          errorEl.style.display = "block";
          btn.disabled = false;
          btn.textContent = "Notify Me";
        }
      })
      .catch(function () {
        errorEl.textContent = "Something went wrong. Please try again.";
        errorEl.style.display = "block";
        btn.disabled = false;
        btn.textContent = "Notify Me";
      });
  });
})();
