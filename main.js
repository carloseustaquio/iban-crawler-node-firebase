const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.iban.com/exchange-rates";
const { Worker } = require("worker_threads");

const workDir = __dirname + "/dbWorker.js";

const mainFunc = async () => {
  const res = await fetchData(url);

  if (!res.data) {
    console.log("Invalid data Obj");
    return;
  }

  const html = res.data;
  const dataObj = new Object();
  const $ = cheerio.load(html);
  const statsTable = $(
    ".table.table-bordered.table-hover.downloads > tbody > tr"
  );

  statsTable.each(function () {
    const title = $(this).find("td").text();
    const newStr = title.split("\t");
    newStr.shift();
    formatStr(newStr, dataObj);
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

async function fetchData(url) {
  console.log("Crawling data...");
  let response = await axios(url).catch((err) => console.log(err));

  if (response.status !== 200) {
    console.log("Error occurred while fetching data");
    return;
  }
  return response;
}

function formatStr(arr, dataObj) {
  const regExp = /[^A-Z]*(^\D+)/;
  const newArr = arr[0].split(regExp);
  dataObj[newArr[1]] = newArr[2];
}
