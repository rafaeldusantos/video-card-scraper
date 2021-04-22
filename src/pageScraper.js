/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
const { makeLogger } = require('apx-logger');
const { SerchResultsRepository } = require('./repositories');
const {
  enums,
  converter,
  sleep
} = require('./utils');

const logger = makeLogger(process.pid, process.env.LOG_LEVEL);

const pagePromise = (
  browser,
  link,
  name,
  infos
) => new Promise(async (resolve) => {
  const newPage = await browser.newPage();
  await newPage.goto(link);

  logger.info(`Lendo dados ${name} - url: ${link}`);

  const title = await newPage.$eval(infos.title, (text) => text.textContent.trim());

  const searchResult = {
    title,
    site: name,
    urlPage: link,
    available: await newPage.$eval(infos.available, (img) => img.alt === 'produto_disponivel'), // TODO: Fazer função para pegar dinamicamente o method de verificação "AVALIABLE"
    imageUrl: await newPage.$eval(infos.imageUrl, (img) => img.url)
      .catch((err) => {
        logger.warn(`imageUrl ${link} Error: ${err}`);
        return null;
      }),
    price: null,
    promoPrice: null,
    manufacturer: converter.filterEnum(title, enums.manufacturerEnum),
    model: converter.filterEnum(title, enums.modelEnum, true),
    memory: converter.filterEnum(title, enums.memoryCapacityEnum),
  };

  try {
    const price = await newPage.$eval(infos.price, (text) => text.textContent);
    if (price) searchResult.price = converter.toNumber(price);
  } catch (err) {
    logger.warn(`price ${link} Error: ${err}`);
  }

  if (infos.promoPrice) {
    try {
      const promoPrice = await newPage.$eval(infos.promoPrice, (text) => text.textContent);
      searchResult.promoPrice = converter.toNumber(promoPrice);
      if (!searchResult.price) searchResult.price = searchResult.promoPrice;
    } catch (err) {
      logger.warn(`promoPrice ${link} Error: ${err}`);
    }
  }

  logger.info(`Salvando dados ${name} - ${link}`);
  await SerchResultsRepository.insert(searchResult);

  resolve(searchResult);
  await newPage.close();
});

const filterPages = (urls) => {
  const filterUrls = [];
  Object.values(enums.modelEnum).forEach((mod) => {
    const filterUrl = urls.filter((link) => link.toUpperCase().replace(/[^a-zA-Z0-9 ]/g, '').includes(mod));
    if (filterUrl.length) filterUrl.map((url) => filterUrls.push(url));
  });
  return filterUrls;
};

const scraper = async (browser, {
  name,
  url,
  selectors
}) => {
  const page = await browser.newPage();
  logger.info(`Navegando para ${name} ${url}...`);
  await page.goto(url);
  const scrapedData = [];

  async function scrapeCurrentPage() {
    await page.waitForSelector(selectors.selectorProducts);
    const urls = await page.$$eval(selectors.listProducts, (links, sel) => {
      const newList = links.filter((link) => {
        const selector = link.querySelector(sel.filterUnavaliableProducts);
        if (selector) {
          switch (sel.methodFilterUnavaliableProducts) {
            case 'image':
              return !selector.src.match(sel.parameterUnavaliableProducts);
            default:
              return !selector.textContent.match(sel.parameterUnavaliableProducts);
          }
        }
        return link;
      });

      return newList.map((el) => el.querySelector(sel.link).href);
    }, selectors);

    const filterUrls = filterPages(urls);
    console.log(filterUrls);

    for (const link in filterUrls) {
      const currentPageData = await pagePromise(browser, filterUrls[link], name, selectors.infos);
      scrapedData.push(currentPageData);
      // eslint-disable-next-line no-await-in-loop
      await sleep(link % 10 === 0 ? 8000 : 5000);
    }

    let nextButtonExist = false;
    try {
      await page.$eval(selectors.availableNextLink, (button) => button !== null);
      nextButtonExist = false;
    } catch (err) {
      nextButtonExist = true;
    }

    await sleep(8000);
    if (nextButtonExist) {
      await page.click(selectors.nextLink);
      return scrapeCurrentPage();
    }
    await page.close();
    logger.info(`Finalizando navegação em ${name} ${url}...`);
    return scrapedData;
  }

  const data = await scrapeCurrentPage();
  return data;
};

module.exports = { scraper };
