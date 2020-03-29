// content.js
var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Content-Type", "text/plain");
function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
function get_label_html(label, src, res) {
  let text = "";
  let border = "";
  let icon = "";

  let url = "#";

  console.log(res);

  if (label.toUpperCase() == "ONDUIDELIJK") {
    icon = onzeker_icon;
    border = "orange";
    text = "Verifi.fi heeft geen info" + "<br>" + "gevonden voor dit artikel.";
  }
  if (label.toUpperCase() == "NO MATCH") {
    icon = nomatch_icon;
    border = "yellow";
    text =
      "Verifi.fi heeft geen overeeenkomsten" +
      "<br>" +
      "gevonden voor dit artikel.            ";
  }
  if (
    label.toUpperCase() == "ONWAAR" ||
    label.toUpperCase() == "GROTENDEELS_ONWAAR"
  ) {
    label = "ONWAAR";

    console.log("ONWAAR", res);
    url = res.url;
    icon = onwaar_icon;
    border = "red";
    text =
      // '<img src="web-icons/onwaar.svg>' +
      "Verifi.fi is <strong style='color: black;'>" +
      parseInt(parseFloat(res.confidence) * 100) +
      "% zeker</strong> dat dit artikel" +
      "<br>" +
      "onwaarheden bevat.                 ";
  }
  if (
    label.toUpperCase() == "WAAR" ||
    label.toUpperCase() == "GROTENDEELS_WAAR"
  ) {
    label = "WAAR";

    console.log("WAAR", res);
    url = res.url;
    icon = waar_icon;
    border = "green";
    text =
      "Verifi.fi is <strong style='color: black;'>" +
      parseInt(parseFloat(res.confidence) * 100) +
      "% zeker</strong> dat dit artikel" +
      "<br>" +
      "verified is.";
  }
  if (src == "hln")
    /*return (
      '<span class="fact-check-label hln label-onwaar" style="' +
      "border: 1px solid " +
      border +
      ";" +
      '">' +
      icon +
      '<span class="hover-content">' +
      "<strong style='color: black;'>" +
      label +
      "</strong>" +
      "<span class='info'>" +
      "  " +
      text +
      "</span>" +
      "<a href='" +
      url +
      "'>Meer info..</a>" +
      "<span class='arrow'>></span>" +
      "</span>" +
      "</span>"
    );*/
    return (
      '<span class="fact-check-label hln label-onwaar" style="' +
      "border-color: " +
      border +
      ";" +
      '">' +
      icon +
      '<span class="normal-wrap">' +
      label +
      '</span><span class="hover-content">' +
      "<strong style='color: black;'>" +
      label +
      "</strong>" +
      "<span class='info'>" +
      "  " +
      text +
      "</span>" +
      "<a target='_blank' href='" +
      url +
      "'>Meer info..</a>" +
      "<span class='arrow'>></span>" +
      "</span>" +
      "</span>"
    );
  else
    return (
      '<span class="fact-check-label fb label-onwaar" style="' +
      "border-color: " +
      border +
      ";" +
      '">' +
      icon +
      '<span class="normal-wrap">' +
      label +
      '</span><span class="hover-content">' +
      "<strong style='color: black;'>" +
      label +
      "</strong>" +
      "<span class='info'>" +
      "  " +
      text +
      "</span>" +
      "<a target='_blank' href='" +
      url +
      "'>Meer info..</a>" +
      "<span class='arrow'>></span>" +
      "</span>" +
      "</span>"
    );
}
function init() {
  console.log("init Hack the Crisis", chrome.runtime);
  //chrome.browserAction.setBadgeText({ text: "0" }); // We have 10+ unread items.
  var tablink = window.location.href;
  console.log("tablink is:", tablink);
  switch (tablink) {
    case "https://www.facebook.com/":
      run_fb();
      break;
    case "https://www.hln.be/":
      run_hln();
      break;
    default:
      console.log("site not supported");
      break;
  }
}
init();
function run_hln() {
  let arr_articles = [];
  let arr_txts = [];
  let s_i = 0;
  $(".page-section").each(function() {
    s_i++;
    console.log("Section", s_i);
    $(this)
      .find("article:visible")
      //.is("")
      .each(function() {
        console.log("ARTICLE");
        $(this)
          .find("h1")
          .each(function() {
            const txt = $(this)
              .text()
              .trim();
            //console.log(txt.length, txt);
          });
        if ($(this).find("picture").length && $(this).find("h1").length) {
          const post = this;
          let txt = $(this)
            .find("h1")
            .first()
            .text()
            .trim();

          if (!txt.endsWith(".")) {
            txt += ".";
          }

          txt = txt.replace(/^\w/, c => c.toUpperCase());
          var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify([txt]),
            redirect: "follow"
          };
          fetch("https://api-v2.factrank.org/bert-match", requestOptions)
            .then(response => response.json())
            .then(result => {
              console.log("Res", result);
              //for (var a = 0; a < result.length; a++) {
              //const _txt = arr_txts[a];
              //const _post = $(arr_articles[a]);
              if (
                result[0].hasOwnProperty("matched") &&
                result[0].matched === false
              ) {
                console.log("No match", txt);
                $(post)
                  .css("position", "relative")
                  .append(get_label_html("NO MATCH", "hln", result[0]));
              } else {
                console.log("Match", txt, result[0]);
                $(post)
                  .css("position", "relative")
                  .append(
                    get_label_html(result[0].conclusion, "hln", result[0])
                  );
              }
              //}
              //console.log($(post).find("img.scaledImageFitWidth.img").length);
            })
            .catch(error => console.log("error", error));
          //arr_txts.push(txt);
          //arr_articles.push(post);
          //console.log("valid");
        } else {
          console.log(
            "invalid",
            $(this).find("picture").length,
            $(this).find("h1").length
          );
        }
        /*
      $(this)
        .find("h1")
        .each(function() {
          const txt = $(this)
            .text()
            .trim();
          console.log(txt.length, txt);
        });
        */
      });
  });
  /*
  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(arr_txts),
    redirect: "follow"
  };
  fetch("https://api-v2.factrank.org/bert-match", requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log("Res", result);
      for (var a = 0; a < result.length; a++) {
        const _txt = arr_txts[a];
        const _post = $(arr_articles[a]);
        if (
          result[a].hasOwnProperty("matched") &&
          result[a].matched === false
        ) {
          console.log("No match", _txt);
          $(_post)
            .css("position", "relative")
            .append(get_label_html("NO MATCH " + a, "hln"));
        } else {
          console.log("Match", _txt, result[a]);
          $(_post)
            .css("position", "relative")
            .append(get_label_html(result[a].conclusion + " " + a, "hln"));
        }
      }
      //console.log($(post).find("img.scaledImageFitWidth.img").length);
    })
    .catch(error => console.log("error", error));
    */
}
function run_fb() {
  var inject_i = 0;
  var demo_post = document.createElement("div");
  demo_post.innerHTML = article_html_1;
  insertAfter(document.getElementById("substream_0"), demo_post);
  inject_i++;

  console.log($("#substream_0"));
  console.log($("#substream_1"));
  console.log($("#substream_2"));

  let interval_loop = setInterval(function() {
    switch (inject_i) {
      case 1:
        if ($('[data-testid="fbfeed_story"]').length > 8) {
          console.log("Injecting", $('[data-testid="fbfeed_story"]')[8]);
          var demo_post = document.createElement("div");
          demo_post.innerHTML = article_html_2;
          insertAfter($('[data-testid="fbfeed_story"]')[8], demo_post);
          inject_i++;
        }
        break;
      case 2:
        if ($('[data-testid="fbfeed_story"]').length > 17) {
          console.log("Injecting");
          var demo_post = document.createElement("div");
          demo_post.innerHTML = article_html_3;
          insertAfter($('[data-testid="fbfeed_story"]')[17], demo_post);
          inject_i++;
        }
        break;
      case 3:
        if ($('[data-testid="fbfeed_story"]').length > 27) {
          console.log("Injecting");
          var demo_post = document.createElement("div");
          demo_post.innerHTML = article_html_4;
          insertAfter($('[data-testid="fbfeed_story"]')[27], demo_post);
          inject_i++;
        }

        break;
      case 4:
        clearInterval(interval_loop);
        break;
    }

    if ($('[data-testid="fbfeed_story"]').length > 8) {
    } else if ($('[data-testid="fbfeed_story"]').length > 8) {
    } else if ($('[data-testid="fbfeed_story"]').length > 8) {
    } else console.log("count");
  }, 1000);

  let i = 0;
  let found = [];
  setInterval(function() {
    $('a[aria-label][target="_blank"]').each(function() {
      var post = $(this).closest("[data-dedupekey]");
      let txt = $(this)
        .attr("aria-label")
        .trim();

      if (!txt.endsWith(".")) {
        txt += ".";
      }

      txt = txt.replace(/^\w/, c => c.toUpperCase());

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
        fetch("https://api-v2.factrank.org/bert-match", requestOptions)
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
              $(post).append(get_label_html("NO MATCH", "fb", result[0]));
            } else {
              $(post).append(
                get_label_html(result[0].conclusion, "fb", result[0])
              );
            }
            //console.log($(post).find("img.scaledImageFitWidth.img").length);
          })
          .catch(error => console.log("error", error));
      }
      i++;
    });
  }, 500);
}
/*
// Inform the background page that
// this tab should have a page-action
chrome.runtime.sendMessage({
  from: "content",
  subject: "showPageAction"
});
*/
