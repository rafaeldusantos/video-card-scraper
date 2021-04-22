const pageScraper = require('./pageScraper');

const { SitesRepository } = require('./repositories');

async function scrapeAll(browserInstance) {
  let browser;
  try {
    browser = await browserInstance;
    const sites = await SitesRepository.findAll();

    await Promise.all(sites.map(async (site) => {
      const scrapedData = {};
      scrapedData.videoCard = await pageScraper.scraper(browser, site);
    }));
    await browser.close();
  } catch (err) {
    console.log('Could not resolve the browser instance => ', err);
  }
}

module.exports = (browserInstance) => scrapeAll(browserInstance);
