const path = require('path')
const puppeteer = require('puppeteer')
const ublockPath = path.join(__dirname, 'bin/uBlock0.chromium')
const FoodSearchScraper = require('./scraper/food-search')
const NutritionalFactsScraper = require('./scraper/nutritional-facts')

const start = async (foodName) => {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${ublockPath}`,
      `--load-extension=${ublockPath}`
    ]
  })
  const page = await browser.newPage()
  const foodSearchScraper = new FoodSearchScraper(page)
  const links = await foodSearchScraper.search(foodName)

  const nutritionalFactsScraper = new NutritionalFactsScraper(page, links)
  await nutritionalFactsScraper.run()
}

start('frango grelhado')
