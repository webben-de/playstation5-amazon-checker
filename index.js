const fs = require("fs");
const say = require("say");
const colors = require("colors");
const open = require("open");
const inquirer = require("inquirer");
const yaml = require("js-yaml");

const amazon = require("./site_methods/amazon");
const saturn = require("./site_methods/saturn");
const { log } = require("console");

const PRODUCTS_CHOICES_TO_CHECK = yaml.safeLoad(
  fs.readFileSync("products.yaml", "utf8")
).products;

let BROWSER = "google chrome";

async function main() {
  try {
    let inq = await inquirer.prompt([
      {
        type: "checkbox",
        choices: PRODUCTS_CHOICES_TO_CHECK,
        message: "Choose Version(s) to check (check with spacebar)",
        name: "version",
      },
      {
        name: "interval",
        type: "number",
        message: "Interval to scrap (seconds)",
        default: 30,
      },
      {
        name: "browser",
        type: "list",
        choices: ["google chrome", "safari", "firefox"],
        message: "Which browser",
        default: "google chrome",
      },
    ]);
    BROWSER = inq.browser;

    // scrap on main run and then by interval
    console.log(inq.version);
    inq.version.forEach(scrapProduct);
    setInterval(() => {
      inq.version.forEach(scrapProduct);
    }, inq.interval * 1000);
  } catch (error) {
    console.log("error while prompting", error);
  }
}

async function scrapProduct(uri, i) {
  const PRODUCT = PRODUCTS_CHOICES_TO_CHECK.find((p) => p.name == uri);
  try {
    if (!PRODUCT.uris) PRODUCT.uris = [PRODUCT.uri];
    PRODUCT.uris.forEach(async (link) => {
      let parsedInfo = {
        title: null,
        price: null,
        availableText: null,
        isAvailble: null,
      };
      switch (true) {
        case link.includes("amazon"):
          parsedInfo = await amazon(link);
          break;
        case link.includes("saturn"):
          parsedInfo = await saturn(link);
          break;
      }
      if (!parsedInfo) {
        return 1;
      } else if (parsedInfo.isAvailble) {
        console.log(colors.rainbow(`Price at: ${parsedInfo.price} `));
        say.speak(parsedInfo.title + parsedInfo.availableText);
        open(uri, { app: BROWSER });
      } else if (parsedInfo.availableText) {
        console.log(colors.red(parsedInfo.availableText));
      }
    });
  } catch (error) {
    console.error(`Error while scraping ${uri}`);
  } finally {
    console.log(colors.zebra(`------------`));
  }
}

main();
