const puppeteer = require("puppeteer");
const { Worker } = require("worker_threads");

const url = "https://www.iban.com/exchange-rates";
const workDir = __dirname + "/dbWorker.js";

const mainFunc = async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);
  const dataObj = new Object();

  console.log("Crawling data...");
  const dataList = await page.evaluate(() => {
    const nodeList = document.querySelectorAll(
      ".table.table-bordered.table-hover.downloads > tbody > tr"
    );

    const arrRows = [...nodeList].map(
      (row) =>
        row.textContent
          .trim()
          .replace(/(\r\n|\n|\r)/gm, "")
          .split("\t\t\t")[1]
    );

    return arrRows;
  });

  await browser.close();

  dataList.forEach((item) => {
    formatStr(item, dataObj);
  });

  return dataObj;
};

mainFunc().then((res) => {
  const worker = new Worker(workDir);
  console.log("Sending crawled data to dbWorker");
  worker.postMessage(res);
  worker.on("message", (message) => {
    console.log(message);
  });
});

function formatStr(str, dataObj) {
  const regExp = /[^A-Z]*(^\D+)/;
  const newArr = str.split(regExp);
  dataObj[newArr[1]] = newArr[2];
}
