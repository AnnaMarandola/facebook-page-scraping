const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const facebookAccount = require("./facebookIds");


const groupLink = "https://www.facebook.com/groups/XXXXXXXXXXX/feed";

async function start() {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--disable-notifications",
      "--no-sandbox",
      "--allow-third-party-modules",
      "--start-maximized",
    ],
    slowMo: 10,
  });
  const page = await browser.newPage();
  await page.goto("https://www.facebook.com");

  const cookieButtonSelector = '[data-cookiebanner="accept_button"]';
  await page.waitForSelector(cookieButtonSelector);
  await page.click(cookieButtonSelector);

  const loginInputSelector = 'input[type="text"]';
  const passwordInputSelector = 'input[type="password"]';
  await page.waitForSelector(loginInputSelector);
  await page.waitForSelector(passwordInputSelector);

  await page.evaluate(
    (login, password, loginInputSelector, passwordInputSelector) => {
      document.querySelector(loginInputSelector).value = login;
      document.querySelector(passwordInputSelector).value = password;
    },
    facebookAccount.login,
    facebookAccount.password,
    loginInputSelector,
    passwordInputSelector
  );
  await page.waitForTimeout(1000);

  const submitButtonSelector = 'button[type="submit"]';
  await page.waitForSelector(submitButtonSelector);
  await page.click(submitButtonSelector);
  await page.waitForTimeout(5000);

  const groupPage = await browser.newPage();
  await groupPage.goto(groupLink);
  await groupPage.waitForTimeout(5000);

    await groupPage.screenshot({ path: "fbscreen.png" });
    await groupPage.waitForTimeout(1000);

  const links = await page.evaluate((groupLink) => {
    const links = [ ...document.querySelectorAll(
        'div[role=feed] .du4w35lb .buofh1pr .tojvnm2t .oajrlxb2[role=link]'
    )].map((link) => link.href)
    scrapedLinks.forEach((scrapedLink) => {
      const split = scrapedLink.href.split("/");
      split.pop();
      const postLink = split.join("/");

      if (!links.includes(postLink)) {
        links.push(postLink);
      }
    });
    return links;
  }, groupLink);

  await fs.writeFile("links.txt", links.join("\r\n"));

  console.log(links);

  await browser.close();
}

start();
