import XSLX from "xlsx";
import puppeteer from "puppeteer";
import { setTimeout } from "node:timers/promises";
import { TiktokHeaders } from "./types";

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const workbook = XSLX.readFile("K:/Desktop/web projects/fm-scrape/fm-accounts-clean.xlsx");
    const worksheet = workbook.Sheets["FM Accounts"];

    // convert the worksheet to json
    const fmAccs: TiktokHeaders[] = XSLX.utils.sheet_to_json(worksheet);

    const dataWithContentCount = [];

    let i = 0;
    for (const acc of fmAccs) {
      const URL = `https://www.tiktok.com${acc.link}`;
      await page.goto(URL, { waitUntil: "networkidle2" });

      await page.setViewport({ width: 1280, height: 800 });

      if (i === 0) {
        await setTimeout(7000);
      } else {
        await setTimeout(3000);
      }

      // on this container: document.querySelector("#main-content-others_homepage > div > div.css-833rgq-DivShareLayoutMain.ee7zj8d4 > div.css-1qb12g8-DivThreeColumnContainer.eegew6e2 > div")
      // get the number of children divs under it and store it in a variable named contents
      // the target div is: document.querySelector("#main-content-others_homepage > div > div.css-833rgq-DivShareLayoutMain.ee7zj8d4 > div.css-1qb12g8-DivThreeColumnContainer.eegew6e2 > div > div:nth-child(n)")
      const contents = await page.evaluate(() => {
        const contents = document.querySelectorAll(
          "#main-content-others_homepage > div > div.css-833rgq-DivShareLayoutMain.ee7zj8d4 > div.css-1qb12g8-DivThreeColumnContainer.eegew6e2 > div > div"
        ).length;

        return contents;
      });

      console.log(
        `done checking profile ${i + 1}: `,
        acc.tiktokName,
        "Found ",
        contents,
        " contents"
      );

      dataWithContentCount.push({
        ...acc,
        contents,
      });

      i++;
    }

    console.log("done checking all profiles");

    // create a new worksheet
    const newWorksheet = XSLX.utils.json_to_sheet(dataWithContentCount);

    // create a new workbook
    const newWorkbook = XSLX.utils.book_new();

    // add the new worksheet to the new workbook
    XSLX.utils.book_append_sheet(newWorkbook, newWorksheet, "FM Accounts");

    // write the new workbook to a new file
    XSLX.writeFile(newWorkbook, "fm-accounts-content-count.xlsx");

    console.log("done writing new file");

    await browser.close();
  } catch (error) {
    console.error(error);
  }
})();
