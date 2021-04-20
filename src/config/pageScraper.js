const clearString = (value) => value.replace(/(\r\n\t|\n|\r|\t)/gm, "");

const scraperObject = {
  url: 'https://www.kabum.com.br/hardware/placa-de-video-vga?pagina=3&ordem=5&limite=30&prime=false&marcas=[]&tipo_produto=[]&filtro=[]',
  async scraper(browser){
      let page = await browser.newPage();
      console.log(`Navigating to ${this.url}...`);
      // Navigate to the selected page
      await page.goto(this.url);

      let scrapedData = [];
      // Wait for the required DOM to be rendered
      async function scrapeCurrentPage(){
          await page.waitForSelector('#listagem-produtos');
          // Get the link to all the required books
          let urls = await page.$$eval('div > .eITELq', links => {
              // Make sure the book to be scraped is in stock
              links = links.filter(link => !link.querySelector('.sc-fznKkj > img').src.match(/indisponivel/))
              // Extract the links from the data
              links = links.map(el => el.querySelector('div > a').href)
              return links;
          });

          console.log(urls);
          // Loop through each of those links, open a new page instance and get the relevant data from them
          let pagePromise = (link) => new Promise(async(resolve, reject) => {
              let dataObj = {};
              let newPage = await browser.newPage();
              await newPage.goto(link);
              dataObj['title'] = await newPage.$eval('#titulo_det > h1', text => text.textContent);
              dataObj['urlPage'] = link;
              try{
                dataObj['price'] = await newPage.$eval('.box_preco .preco_normal', text => text.textContent.replace(/(\r\n\t|\n|\r|\t)/gm, ""));
              }catch(err){
                dataObj['price'] = "";
              }
              try{
                dataObj['promoPrice'] = await newPage.$eval('.box_preco .preco_desconto strong', text => text.textContent.trim())
              }catch(err){
                dataObj['promoPrice'] = ""
              }
              dataObj['available'] = await newPage.$eval('.disponibilidade img', img => img.alt === 'produto_disponivel');
              dataObj['imageUrl'] = await newPage.$eval('#fotos .flex-active-slide > img', img => img.src);
              console.log(dataObj);
              resolve(dataObj);
              await newPage.close();
          });

          for(link in urls){
              let currentPageData = await pagePromise(urls[link]);
              scrapedData.push(currentPageData);

            }
          // When all the data on this page is done, click the next button and start the scraping of the next page
          // You are going to check if this button exist first, so you know if there really is a next page.
          let nextButtonExist = false;
          // try{
          //     const nextButton = await page.$eval('.sc-fznWOq[disabled]', button  => button !== null);
          //     nextButtonExist = false;
          // }
          // catch(err){
          //     nextButtonExist = true;
          // }
          if(nextButtonExist){
              await page.click('.sc-fznWOq');
              return scrapeCurrentPage(); // Call this function recursively
          }
          await page.close();
          return scrapedData;
      }
      let data = await scrapeCurrentPage();
      console.log(data);
      return data;
  }
}


module.exports = scraperObject;