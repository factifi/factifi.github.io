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
    console.log("ONDUIDELIJK", res);
    url = res.url;
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

  if (url.startsWith("www")) url = "https://" + url;

  if (src == "hln")
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
      .each(function() {
        console.log("ARTICLE");
        $(this)
          .find("h1")
          .each(function() {
            const txt = $(this)
              .text()
              .trim();
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
            })
            .catch(error => console.log("error", error));
        } else {
          console.log(
            "invalid",
            $(this).find("picture").length,
            $(this).find("h1").length
          );
        }
      });
  });
}
function run_fb() {
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
      } else {
        console.log("NEW!", "visible?:", $(post).is(":visible"));
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
          })
          .catch(error => console.log("error", error));
      }
      i++;
    });
  }, 500);
}
