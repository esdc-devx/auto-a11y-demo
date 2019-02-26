const { AxePuppeteer } = require("axe-puppeteer");
const AxeReports = require("axe-reports");
const puppeteer = require("puppeteer");


async function a11ytest(page, name) {
  const results = await new AxePuppeteer(page)
    .withTags(['wcag2a','wcag2aa'])
    .exclude([
      "ul[role=menubar]" //Exlude MenuBar as it's WET and not accessible
    ])
    .analyze();
  AxeReports.processResults(results, "csv", "reports/" + name, true);
}

async function screenshot(page, name) {
  return page.screenshot({ path: "screenshots/" + name + ".png" });
}

async function runtest(page, name) {
  return Promise.all([a11ytest(page, name), screenshot(page, name)]);
}

(async () => {

  const orgId = process.env.ROEWEB_ORGID;
  const username = process.env.ROEWEB_UNAME;
  const password = process.env.ROEWEB_PWORD;

  const browser = await puppeteer.launch({ headless: true});
  console.log("Getting New Page");
  const page = await browser.newPage();
  console.log("Bypassing CSP");
  await page.setBypassCSP(true);

  console.log("Navigating to first page");
  await page.goto(
    "https://srv136.services.gc.ca/ecas-seca/rascl/Initialize.aspx?Lang=eng&Idp=https://clegc-gckey.gc.ca&AppCode=ROE"
  );
  await screenshot(page, "firstpage");

  console.log("Entering in Username and Password");
  await page.type("#token1", username);
  await page.type("#token2", password);

  await Promise.all([
    page.waitForNavigation(), // The promise resolves after navigation has finished
    page.click("button[type=submit]")
  ]);

  await screenshot(page, "secondpage");

  await Promise.all([
    page.waitForSelector("h1[property=name]"), // The promise resolves after navigation has finished
    page.click("input[type=submit]")
  ]);
  await screenshot(page, "thirdpage.png");

  await page.goto(
    "https://srv136.services.gc.ca/ROE-RE/ROEWeb-REWeb/pro/MainMenu.aspx?org_id=" + orgId
  );
  await runtest(page, "MainMenu.aspx");

  await page.goto(
    "https://srv136.services.gc.ca/ROE-RE/ROEWeb-REWeb/pro/ROE/SelectBusiness?org_id=" + orgId
  );
  await runtest(page, "SelectBusiness");

  await page.goto(
    "https://srv136.services.gc.ca/ROE-RE/ROEWeb-REWeb/pro/Searc>ssued?org_id=" + orgId + "&amend=True"
  );
  await runtest(page, "Amend");

  await page.goto(
    "https://srv136.services.gc.ca/ROE-RE/ROEWeb-REWeb/pro/PayrollExtract/ViewFiles?org_id=" + orgId
  );
  await runtest(page, "ViewPayroll");

  await page.goto(
    "https://srv136.services.gc.ca/ROE-RE/ROEWeb-REWeb/pro/PayrollExtract/Upload?org_id=" + orgId
  );
  await runtest(page, "UploadPayroll");

  // const input = page.$('input[id=Files]');
  // await Promise.all([
  //   input.uploadFile('./assets/auto-upload-payroll-extract.blk'), //uploadFile thows error 'unkonw function'
  //   page.select('input[id=FolderId]', '0'),
  //   page.click('input[name=Declaration]'),
  //   page.click("button[id=upload]")
  // ]);
  // await runtest(page, "UploadPayrollStatus");

  await page.goto(
    "https://srv136.services.gc.ca/ROE-RE/ROEWeb-REWeb/pro/Requests/Prints?org_id=" + orgId
  );
  await runtest(page, "RequestedPrintFiles");


  await page.close();
  await browser.close();
})();
