// content.js

var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Content-Type", "text/plain");

function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function init() {
  console.log("init Hack the Crisis", article_html);

  var tablink = window.location.href;

  console.log("tablink is:", tablink);

  let i = 0;
  let found = [];
  setInterval(function() {
    $('a[aria-label][target="_blank"]').each(function() {
      var post = $(this).closest("[data-dedupekey]");
      const txt = $(this)
        .attr("aria-label")
        .trim();

      if (post.hasClass("check-post-attr") || found.indexOf(txt) > -1) {
        // console.log("Already processed", post.data("check-id"), txt);
      } else {
        console.log("NEW!");
        post.addClass("check-post-attr");
        post.data("check-id", i);
        found.push(txt);
        console.log("Header found:", i, txt);

        var requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: JSON.stringify([txt]),
          redirect: "follow"
        };

        fetch("https://api-v2.factrank.org/match", requestOptions)
          .then(response => response.text())
          .then(result => console.log("Res", result, post))
          .catch(error => console.log("error", error));
      }

      i++;
    });
  }, 500);
}
init();

// Inform the background page that
// this tab should have a page-action
chrome.runtime.sendMessage({
  from: "content",
  subject: "showPageAction"
});
