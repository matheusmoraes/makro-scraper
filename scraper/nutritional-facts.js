const { zipObject } = require('lodash')

class NutritionalFactsScraper {
  constructor (page, links) {
    this.page = page
    this.links = links
  }

  async run () {
    for (let link of [this.links[0]]) {
      await this.getFoodInfo(link)
    }
  }

  async getFoodInfo (link) {
    await this.page.waitFor(2 * 1000)
    await this.page.goto(link, {
      timeout: 300000
    })

    // 0 - brand, 1 - name
    const foodDescription = await this.page.evaluate(() => {
      return document.querySelector('.food-description').textContent
    })

    console.log(foodDescription)

    const servingOptions = await this.page.evaluate(() => {
      const options = Array.from(document
        .querySelectorAll('#food_entry_weight_id > option'))
      return options.map(option => option.value)
    })

    await this.scrapeServingOptions(servingOptions)
  }

  async scrapeServingOptions (servingOptions) {
    for (let servingOption of servingOptions) {
      await this.page.select('#food_entry_weight_id', servingOption)
      await this.page.waitFor(1000)

      const nutritionFacts = await this.page.evaluate(_evaluateNutritionalFacts)

      const nutritionFactsFormatted = zipObject(
        nutritionFacts.nutrients,
        nutritionFacts.values
      )

      console.log(`FACTS\nServing: ${nutritionFacts.servingQuantity} x ${nutritionFacts.servingWeight}`, nutritionFactsFormatted, '\n\n')
    }
  }
}

function _evaluateNutritionalFacts () {
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
}

module.exports = NutritionalFactsScraper
