const cheerio = require("cheerio");
const axios = require("axios").default;

const DETECTION_STRING_NOT_AVAILABLE = "Derzeit nicht verfügbar."; //OTHER COUNTRY, NEEDS A CHANGE
const AVAILABLE_MESSAGE = "Auf Lager.";
const AVAILABLE_SELECTOR = "#availability > span";

module.exports = async function (link) {
  let product_page;
  console.log(`Checking for ${link} on amazon`);

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
      error.reponse &&
      error.response.data.includes(
        "To discuss automated access to Amazon data please contact"
      )
    ) {
      console.log(colors.red("Amazon is mad"));
    }
    return null;
  }
  const $ = cheerio.load(product_page);
  const title = $("#productTitle").text().trim();
  const price = $("#priceblock_ourprice").text().trim();
  const availableText = `Amazon: ${$(AVAILABLE_SELECTOR).text().trim()}`;
  return {
    title,
    price,
    availableText,
    isAvailble: availableText === AVAILABLE_MESSAGE,
  };
};
