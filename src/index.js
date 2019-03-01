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
  //const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
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
  page.click(
    "body > div > div.row > main > fieldset > form > div:nth-child(2) > label > input[type=radio]"
  );
  await Promise.all([
    page.click("button[type=submit]"),
    page.waitForSelector("body > div > div.row > main > a.btn.btn-primary")
  ]);
  await runtest(page, "AssistantIntroductionNewROE");
  //confirm user
  await Promise.all([
    page.click("body > div > div.row > main > a.btn.btn-primary"),
    page.waitForNavigation()
  ]);
  await runtest(page, "AssistantConfirmUser");
  //employer
  await page.click(
    "body > div > div.row > main > form > fieldset > div:nth-child(3) > label > input[type=radio]"
  );
  await Promise.all([
    page.waitForNavigation(),
    page.click("body > div > div.row > main > form > button")
  ]);
  await runtest(page, "AssistantEmployerInfo");
  //employee
  await Promise.all([
    page.select("#OrgBusinessId", "117816201"),
    page.waitForFunction(
      "document.querySelector('#Contact').offsetParent !== null"
    ) //Waiting for the contact div to be visible.
  ]);
  // await page.type("#Address_Line1", "123 AutoTest St");
  // await page.type("#Address_City", "AutoTest");
  // await page.select("#Address_ProvinceState", "AB");
  // await page.select("#Address_Country", "CA");
  // await page.type("#Address_PostalCode", "K1T3S7");
  await page.type("#Contact_FirstName", "Auto");
  await page.type("#Contact_LastName", "Test");
  await page.type("#Contact_AreaCode", "999");
  await page.type("#Contact_PhoneNumber", "9999999");
  await Promise.all([
    page.click(
      "body > div > div.row > main > div.roe-wb-frmvld > form > button"
    ),
    page.waitForSelector("#Sin")
  ]);
  await runtest(page, "AssistantEmployeeInfo");
  //employment
  await page.type("#Sin", "990000002");
  console.log("sin done");
  await page.type("#FirstName", "Auto");
  await page.type("#LastName", "Test");
  await page.type("#AddressLine1", "123 AutoTest St");
  await page.type("#AddressLine2", "AutoTest");
  await page.type("#PostalCode", "K1T3S7");
  await Promise.all([
    page.click(
      "body > div > div.row > main > div.roe-wb-frmvld > form > button"
    ),
    page.waitForNavigation()
  ]);
  await runtest(page, "AssistantEmploymentInfo");
  //reason for issue
  await Promise.all([
    page.select("#PayPeriod", "M"),
    page.waitForFunction(
      "document.querySelector('#PayPeriodDates').offsetParent !== null"
    ) //Waiting for the pay period dates div to be visible.
  ]);
  await page.type("#FirstDayWorked", "01012018");
  await page.type("#LastDayPaid", "28022018");
  await page.type("#FinalPayPeriodEndDate", "28022018");
  await Promise.all([
    page.click("button[type=submit]"),
    page.waitForNavigation()
  ]);
  await runtest(page, "AssistantReasonForIssuing");
  //employment details
  await page.select("#ReasonForIssuing", "A");
  await Promise.all([
    page.click("button[type=submit]"),
    page.waitForNavigation()
  ]);
  await runtest("AssistantEmploymentDetails");
  //special payments
  await Promise.all([
    page.click("button[type=submit]"),
    page.waitForNavigation()
  ]);
  await runtest("AssistantSpecialPayments");
  //vacation payments
  await Promise.all([
    page.click("button[type=submit]"),
    page.waitForNavigation()
  ]);
  await runtest("AssistantVacationPayments");
  //stat holliday payments
  await Promise.all([
    page.click("button[type=submit]"),
    page.waitForNavigation()
  ]);
  await runtest("AssistantStatHolidayPayments");
  //earnings
  await Promise.all([
    page.click("button[type=submit]"),
    page.waitForNavigation()
  ]);
  await runtest("AssistantEarningsPayPeriod");
  //insurable hours
  await page.type("#stdAutoFillAmount", "1000");
  await Promise.all([
    page.click("#stdAutoFillButton"),
    page.waitForFunction("autoFillClick") //wait for the function from the click to run
  ]);
  await Promise.all([
    page.click("button[type=submit]"),
    page.waitForNavigation()
  ]);
  await runtest(page, "AssistantInsurableHours");
  //total insurable amounts
  await page.type("#TotalInsurableHours", "100");
  await Promise.all([
    page.click("button[type=submit]"),
    page.waitForNavigation()
  ]);
  await runtest(page, "AssistantTotalInsurableAmounts");
  //ready to submit
  await Promise.all([
    page.click("button[type=submit]"),
    page.waitForNavigation()
  ]);
  await runtest(page, "AssistantReadySubmit");
  //r&s completed roe
  await Promise.all([
    page.click("button[type=submit]"),
    page.waitForNavigation()
  ]);
  await runtest(page, "AssistantRasCompletedRoe");
  //submission status
  await page.click("#Declaration");
  await Promise.all([
    page.click("button[type=submit]"),
    page.waitForNavigation()
  ]);
  await runtest(page, "AssistantSubmissionStatus");

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
