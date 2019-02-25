const { AxePuppeteer } = require("axe-puppeteer");
const  AxeReports = require("axe-reports");
const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({headless: false});
  console.log("Getting New Page");
  const page = await browser.newPage();
  console.log("Bypassing CSP");
  await page.setBypassCSP(true);

  console.log("Navigating to first page");
  await page.goto("https://srv136.services.gc.ca/ecas-seca/rascl/Initialize.aspx?Lang=eng&Idp=https://clegc-gckey.gc.ca&AppCode=ROE");
  await page.screenshot({path: "firstpage.png"});

  console.log("Entering in Username and Password");
  //Enter Username  and Password
  await page.type("#token1", process.env.ROEWEB_UNAME);
  await page.type("#token2", process.env.ROEWEB_PWORD);

  await Promise.all([
    page.waitForNavigation(), // The promise resolves after navigation has finished
    page.click("button[type=submit]"),
  ]);
  //await page.waitForSelector("button[id=continue]");
  await page.screenshot({path: "secondpage.png"});

  await Promise.all([
    page.waitForSelector("h1[property=name]"), // The promise resolves after navigation has finished
    page.click("input[type=submit]"),
  ]);
  await page.screenshot({path: "thirdpage.png"});

  await Promise.all([
    page.waitForNavigation(), // The promise resolves after navigation has finished
    page.goto("https://srv136.services.gc.ca/ROE-RE/ROEWeb-REWeb/pro/MainMenu.aspx?org_id=-1177590")
  ]);
  await page.screenshot({path: "roewebfirstpage.png"});

  const results = await new AxePuppeteer(page).analyze();
  AxeReports.createCsvReport(results);
  await page.close();
  await browser.close();
})();
