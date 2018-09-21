const { zipObject } = require('lodash')

class NutritionalFactsScraper {
  constructor (page, links) {
    this.page = page
    this.links = links
  }

  async run () {
    for (let link of this.links) {
      await this.getFoodInfo(link)
    }
  }

  async getFoodInfo (link) {
    await this.page.waitFor(2 * 1000)
    console.log('Vai abrir detalhes', link)
    await this.page.goto(link, {
      timeout: 300000
    })
    console.log('Abriu detalhes')
    const nutritionFacts = await this.page.evaluate(_evaluateNutritionalFacts)

    const nutritionFactsFormatted = zipObject(
      nutritionFacts.nutrients,
      nutritionFacts.values
    )

    console.log('Facts: ', nutritionFactsFormatted)
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
