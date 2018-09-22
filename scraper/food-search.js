const { BASE_URL, SEARCH_PATH } = require('./constants')
const SEARCH_URL = `${BASE_URL}${SEARCH_PATH}`

class FoodSearchScraper {
  constructor (page) {
    this.page = page
  }

  async search (foodName) {
    await this.page.goto(SEARCH_URL)

    await this.page.click('#search')
    await this.page.keyboard.type(foodName)

    await this.page.evaluate(() => {
      const searchForm = document.querySelector('form[action="/en/food/search"]')
      searchForm.submit()
    })

    await this.page.waitForSelector('#main > #new_food_list > ul.food_search_results')

    const links = await this.page.evaluate(() => {
      const selector = Array.from(document.querySelectorAll('ul.food_search_results > li'))
      const anchors = selector.map(line => line.querySelector('a'))
      return anchors.map(anchor => anchor.href)
    })

    return links
  }
}

module.exports = FoodSearchScraper
