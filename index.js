const { AxePuppeteer } = require("axe-puppeteer");
const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setBypassCSP(true);

  await page.goto("https://www.canada.ca/en/employment-social-development/programs/ei/ei-list/ei-roe/access-roe.html");

  const results = await new AxePuppeteer(page).analyze();
  console.log(results);

  await page.close();
  await browser.close();
})();
