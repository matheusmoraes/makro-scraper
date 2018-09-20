const path = require('path')
const puppeteer = require('puppeteer')
const ublockPath = path.join(__dirname, 'bin/uBlock0.chromium')
const { zipObject } = require('lodash')
const FoodSearchScraper = require('./scraper/food-search')

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

  for (let link of links) {
    await getFoodInfo(page, link)
  }
}

async function getFoodInfo (page, mainLink) {
  // Step 2
  await page.waitFor(2 * 1000)
  console.log('Vai abrir detalhes', mainLink)
  await page.goto(mainLink, {
    timeout: 300000
  })
  console.log('Abriu detalhes')
  const nutritionFacts = await page.evaluate(() => {
    const servingQuantity = document.querySelector('#food_entry_quantity')
    const servingWeight = document.querySelector('#food_entry_weight_id')
    const nutritionFactsTable = document.querySelector('table#nutrition-facts > tbody')

    const tds = Array.from(nutritionFactsTable.querySelectorAll('td'))
    let nutrients = []
    let values = []
    for (let i = 0; tds.length > i; i++) {
      if (i % 2 === 0) {
        nutrients.push(tds[i].textContent)
      } else {
        values.push(tds[i].textContent)
      }
    }

    return {
      servingQuantity: servingQuantity.value,
      servingWeight: servingWeight.selectedOptions[0].textContent,
      nutrients,
      values
    }
  })

  const nutritionFactsFormatted = zipObject(
    nutritionFacts.nutrients,
    nutritionFacts.values
  )

  console.log('Facts: ', nutritionFactsFormatted)
}

start('frango grelhado')
