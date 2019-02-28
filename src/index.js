const { AxePuppeteer } = require("axe-puppeteer");
const AxeReports = require("axe-reports");
const puppeteer = require("puppeteer");

async function a11ytest(page, name) {
  console.log("Assessing: " + page.url());
  const results = await new AxePuppeteer(page)
    .withTags(["wcag2a", "wcag2aa"])
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

  const browser = await puppeteer.launch({ headless: true });
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
    "https://srv136.services.gc.ca/ROE-RE/ROEWeb-REWeb/pro/MainMenu.aspx?org_id=-" +
      orgId
  );
  await runtest(page, "MainMenu.aspx");

  await page.goto(
    "https://srv136.services.gc.ca/ROE-RE/ROEWeb-REWeb/pro/ROE/SelectBusiness?org_id=-" +
      orgId
  );
  await runtest(page, "SelectBusiness");

  await page.goto(
    "https://srv136.services.gc.ca/ROE-RE/ROEWeb-REWeb/pro/Search/Issued?org_id=-" +
      orgId +
      "&amend=True"
  );
  await runtest(page, "Amend");

  await page.goto(
    "https://srv136.services.gc.ca/ROE-RE/ROEWeb-REWeb/pro/PayrollExtract/ViewFiles?org_id=-" +
      orgId
  );
  await runtest(page, "ViewPayroll");

  await page.goto(
    "https://srv136.services.gc.ca/ROE-RE/ROEWeb-REWeb/pro/PayrollExtract/Upload?org_id=-" +
      orgId
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
    "https://srv136.services.gc.ca/ROE-RE/ROEWeb-REWeb/pro/Requests/Prints?org_id=-" +
      orgId
  );
  await runtest(page, "RequestedPrintFiles");

  //Move Folder
  await page.goto(
    "https://srv136.services.gc.ca/ROE-RE/ROEWeb-REWeb/pro/Folder/MoveAll?org_id=-" +
      orgId
  );
  await runtest(page, "MoveAll");

  //Move Folder Confirmation Page
  await page.select("select[id=FromFolder]", "#none#");
  await page.select("select[id=ToFolder]", orgId + "01");

  await Promise.all([
    page.waitForNavigation(), // The promise resolves after navigation has finished
    page.click("button[type=submit]")
  ]);

  await runtest(page, "MoveAllConfirmation");

  //ROE Web Assistant - should be run in sequence
  //For some reason the promis all is needed so the page.type doesn't get jubled into one feild
  //Welcome
  await page.goto(
    "https://srv136.services.gc.ca/ROE-RE/ROEWeb-REWeb/pro/Assistant/IntroductionWelcome?org_id=-" +
      orgId
  );
  await runtest(page, "AssistantIntroductionWelcome");
  //new roe
  await Promise.all([
    page.click(
      "body > div > div.row > main > fieldset > form > div:nth-child(2) > label > input[type=radio]"
    )
  ]);
  await page.click("body > div > div.row > main > fieldset > form > button");
  await page.waitForNavigation();
  await runtest(page, "AssistantIntroductionNewROE");
  //confirm user
  await page.click("body > div > div.row > main > a.btn.btn-primary");
  await page.waitForNavigation();
  await runtest(page, "AssistantConfirmUser");
  //employer
  await Promise.all([
    page.click(
      "body > div > div.row > main > form > fieldset > div:nth-child(3) > label > input[type=radio]"
    )
  ]);
  await page.click("body > div > div.row > main > form > button");
  await page.waitForNavigation();
  await runtest(page, "AssistantEmployerInfo");
  //employee
  await Promise.all([page.select("#OrgBusinessId", "117816201")]);
  await Promise.all([page.type("#Address_Line1", "123 AutoTest St")]);
  await Promise.all([page.type("#Address_City", "AutoTest")]);
  await Promise.all([
    page.select("#Address_ProvinceState", "AB"),
    page.select("#Address_Country", "CA"),
    page.type("#Address_PostalCode", "K1T3S7")
  ]);
  await Promise.all([page.type("#Contact_FirstName", "Auto")]);
  await Promise.all([page.type("#Contact_LastName", "Test")]);
  await Promise.all([page.type("#Contact_AreaCode", "999")]);
  await Promise.all([page.type("#Contact_PhoneNumber", "9999999")]);
  await page.click(
    "body > div > div.row > main > div.roe-wb-frmvld > form > button"
  );
  await page.waitForNavigation();
  await runtest(page, "AssistantEmployeeInfo");
  //employment
  await Promise.all([page.type("#Sin", "123456782")]);
  await Promise.all([page.type("#FirstName", "Auto")]);
  await Promise.all([page.type("#LastName", "Test")]);
  await Promise.all([page.type("#AddressLine1", "123 AutoTest St")]);
  await Promise.all([page.type("#AddressLine2", "AutoTest")]);
  await Promise.all([page.type("#PostalCode", "K1T3S7")]);
  await page.click(
    "body > div > div.row > main > div.roe-wb-frmvld > form > button"
  );
  await page.waitForNavigation();
  await runtest(page, "AssistantEmploymentInfo");

  await page.goto(
    "https://srv136.services.gc.ca/ROE-RE/ROEWeb-REWeb/pro/Search/Draft?org_id=-" +
      orgId
  );
  await runtest(page, "SearchDraft");
  await page.type("#SIN", "123456782");
  await page.click("button[type=submit]");
  await page.waitForNavigation();
  await runtest(page, "SearchDraftResults");

  await page.close();
  await browser.close();
})();
