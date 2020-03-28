// content.js

var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Content-Type", "text/plain");

function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function get_label_html(label) {
  let color = "red";
  if (label.toUpperCase() == "ONDUIDELIJK") {
    color = "orange";
  }
  if (label.toUpperCase() == "NO MATCH") {
    color = "grey";
  }

  return (
    '<span class="fact-check-label label-onwaar" style="' +
    "position: absolute;" +
    "display: block;" +
    "top: 0px;" +
    "right: 0px;" +
    "background-color: " +
    color +
    ";" +
    "/* z-index: 999999999; */" +
    "font-size: 30px;" +
    "color: white;" +
    "/* width: 200px; */" +
    "/* height: 100px; */" +
    "line-height: 30px;" +
    "padding: 10px;" +
    '">' +
    label +
    "</span>"
  );
}

function init() {
  console.log("init Hack the Crisis", chrome.runtime);
  //chrome.browserAction.setBadgeText({ text: "0" }); // We have 10+ unread items.
  var demo_post = document.createElement("div");
  demo_post.innerHTML = article_html;
  insertAfter(document.getElementById("substream_0"), demo_post);

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

      if (
        !$(post).is(":visible") ||
        post.hasClass("check-post-attr") ||
        found.indexOf(txt) > -1
      ) {
        // console.log("Already processed", post.data("check-id"), txt);
      } else {
        console.log("NEW!", "visible?:", $(post).is(":visible"));
        post.addClass("check-post-attr");
        post.data("check-id", i);
        found.push(txt);
        console.log("Header found:", i, txt);
        //chrome.browserAction.setBadgeText({ text: found.length + "" }); // We have 10+ unread items.

        var requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: JSON.stringify([txt]),
          redirect: "follow"
        };

        fetch("https://api-v2.factrank.org/match", requestOptions)
          .then(response => response.json())
          .then(result => {
            console.log("Res", result, txt);

            const img_container = $(post)
              .find("img.scaledImageFitWidth.img")
              .parent("div");

            if (
              result[0].hasOwnProperty("matched") &&
              result[0].matched === false
            ) {
              console.log("No match");
              $(img_container).append(get_label_html("NO MATCH"));
            } else {
              $(img_container).append(get_label_html(result[0].conclusion));
            }

            //console.log($(post).find("img.scaledImageFitWidth.img").length);
          })
          .catch(error => console.log("error", error));
      }

      i++;
    });
  }, 500);
}
init();

/*
// Inform the background page that
// this tab should have a page-action
chrome.runtime.sendMessage({
  from: "content",
  subject: "showPageAction"
});
*/
