import XSLX from "xlsx";

// read ../fm.accounts.xlsx
const workbook = XSLX.readFile("K:/Desktop/web projects/fm-scrape/fm-accounts.xlsx");
const worksheet = workbook.Sheets["FM Accounts"];

// convert the worksheet to json
const fmAccs = XSLX.utils.sheet_to_json(worksheet);

// remove duplicates on fmAccs using set
const uniqueFmAccs = fmAccs.filter(
  (acc: any, index: number, self: any[]) =>
    index === self.findIndex((a) => a.tiktokName === acc.tiktokName)
);

console.log("Done removing duplicates");

// write the data to an excel file
const newWorkbook = XSLX.utils.book_new();
const newWorksheet = XSLX.utils.json_to_sheet(uniqueFmAccs);
XSLX.utils.book_append_sheet(newWorkbook, newWorksheet, "FM Accounts");

XSLX.writeFile(newWorkbook, "fm-accounts-clean.xlsx");

console.log("Now writing to excel file");
