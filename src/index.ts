import puppeteer from "puppeteer";
import { setTimeout } from "node:timers/promises";
import XSLX from "xlsx";
import { TiktokHeaders } from "./types";

(async () => {
  try {
    const URL = "https://www.tiktok.com/search/user?lang=en&q=franklin%20miano";

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(URL, { waitUntil: "networkidle2" });

    await page.setViewport({ width: 1280, height: 800 });

    // wait for 2minutes before doing anything
    await setTimeout(120000);

    console.log("done waiting for 2 minutes");

    // after waiting for 2 minute, check this: document.querySelector("#tabs-0-panel-search_account > div") and get all of its content
    // the content is a div then get
    // tiktokName: document.querySelector("#search_user-item-user-link-0 > a.e10wilco3.css-18z0n14-StyledLink-StyledDivInfoWrapper.er1vbsz0 > p.css-1ns35wh-PTitle.e10wilco4")
    // accountName: document.querySelector("#search_user-item-user-link-97 > a.e10wilco3.css-18z0n14-StyledLink-StyledDivInfoWrapper.er1vbsz0 > p.css-1n1o5vj-DivSubTitleWrapper.e10wilco5")
    // href: document.querySelector("#search_user-item-user-link-0 > a.e10wilco3.css-18z0n14-StyledLink-StyledDivInfoWrapper.er1vbsz0")
    // store it in a variable named fmAccs
    const fmAccs: TiktokHeaders[] = await page.evaluate(() => {
      const fmAccs: any[] = [];
      const fmAccsEl = document.querySelectorAll("#tabs-0-panel-search_account > div > div");
      fmAccsEl.forEach((fmAcc) => {
        if (fmAcc) {
          const fmTiktok = fmAcc.querySelector("a > p:first-child")?.textContent || "";
          const fmAccName = fmAcc.querySelector("a > p:nth-child(2)")?.textContent || "";
          const fmBio = fmAcc.querySelector("a > p:nth-child(3)")?.textContent || "";
          const fmAccLink = fmAcc.querySelector("a")?.getAttribute("href");

          // if fmTiktok, fmAccName or fmAccLink includes ['franklin', 'frank', 'miano', 'msb'], push it to fmAccs
          if (
            fmTiktok.toLowerCase().includes("franklin") ||
            fmTiktok.toLowerCase().includes("frank") ||
            fmTiktok.toLowerCase().includes("miano") ||
            fmTiktok.toLowerCase().includes("msb") ||
            fmAccName.toLowerCase().includes("franklin") ||
            fmAccName.toLowerCase().includes("frank") ||
            fmAccName.toLowerCase().includes("miano") ||
            fmAccName.toLowerCase().includes("msb") ||
            fmAccLink?.toLowerCase().includes("franklin") ||
            fmAccLink?.toLowerCase().includes("frank") ||
            fmAccLink?.toLowerCase().includes("miano") ||
            fmAccLink?.toLowerCase().includes("msb")
          ) {
            fmAccs.push({
              tiktokName: fmTiktok,
              accountName: fmAccName,
              bio: fmBio,
              link: fmAccLink,
            });
          }
        }
      });
      return fmAccs;
    });

    console.log("Done getting all the accounts");
    console.log("Now writing to excel file");

    // write the data to an excel file
    const worksheet = XSLX.utils.json_to_sheet(fmAccs);
    const workbook = XSLX.utils.book_new();
    XSLX.utils.book_append_sheet(workbook, worksheet, "FM Accounts");
    XSLX.writeFile(workbook, "fm-accounts.xlsx");

    console.log("Done writing to excel file");

    await browser.close();
  } catch (error) {
    console.error(error);
  }
})();
