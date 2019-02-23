const { AxePuppeteer } = require("axe-puppeteer");
const  AxeReports = require("axe-reports");
const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setBypassCSP(true);

  await page.goto("https://srv136.services.gc.ca/ecas-seca/rascl/Initialize.aspx?Lang=eng&Idp=https://clegc-gckey.gc.ca&AppCode=ROE");

  //Enter Username  and Password
  await page.type("#token1", process.env.ROEWEB_UNAME);
  await page.type("#token2", process.env.ROEWEB_PWORD);
  await page.click("button[type=submit]");
  await page.waitForSelector("button[id=continue]");
  await page.screenshot({path: "example.png"});
  const results = await new AxePuppeteer(page).analyze();
  AxeReports.createCsvReport(results);
  await page.close();
  await browser.close();
})();
