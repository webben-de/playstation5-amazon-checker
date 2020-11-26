const colors = require("colors");
const cheerio = require("cheerio");
const axios = require("axios").default;

const DETECTION_STRING_NOT_AVAILABLE = "Derzeit nicht verfügbar."; //OTHER COUNTRY, NEEDS A CHANGE
const AVAILABLE_MESSAGE = "Auf Lager.";
const AVAILABLE_SELECTOR = "#availability > span";

module.exports = async function (link) {
  console.log(`Checking for ${link} on saturn`);

  let product_page;
  try {
    product_page = (
      await axios.get(link, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36",
        },
      })
    ).data;
  } catch (error) {
    console.log(error);
    if (
      error &&
      error.response &&
      error.response.data.includes(
        "as ging uns leider zu schnell. Um fortzufahren und alle"
      )
    ) {
      console.log(colors.red("Saturn is mad"));
    }
    return null;
  }
  const $ = cheerio.load(product_page);
  const title = $("h1").text().trim();
  const price = $("span[font-family=price]").text().trim();
  const button = $("#pdp-add-to-cart-button").attr("disabled");

  return {
    title,
    price,
    availableText: "Ausverkauft",
    isAvailble: availableText === AVAILABLE_MESSAGE,
  };
};
