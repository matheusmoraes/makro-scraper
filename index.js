const puppeteer = require('puppeteer')
const { zipObject } = require('lodash')

const BASE_URL = 'https://www.myfitnesspal.com.br'

const start = async (foodName) => {
  const SEARCH_URL = `${BASE_URL}/en/food/search`
  const browser = await puppeteer.launch({
    headless: false
  })
  const page = await browser.newPage()

  await page.goto(SEARCH_URL)

  await page.click('#search')
  await page.keyboard.type(foodName)

  await page.evaluate(() => {
    const searchForm = document.querySelector('form[action="/en/food/search"]')
    searchForm.submit()
  })

  await page.waitForSelector('#main > #new_food_list > ul.food_search_results')

  // Get links from page
  const links = await page.evaluate(() => {
    const selector = Array.from(document.querySelectorAll('ul.food_search_results > li'))
    const anchors = selector.map(line => line.querySelector('a'))
    return anchors.map(anchor => anchor.href)
  })

  console.log('Links: ')
  console.log(links.join('\n'))

  const mainLink = links[0]

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
