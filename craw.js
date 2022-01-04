const fs = require('fs-extra')
const puppeteer = require('puppeteer')

let map = fs.readFileSync('./user.json')
map = JSON.parse(map)
console.log(map)

// async function launch() {
//   const browser = await puppeteer.launch({
//     headless: false,
//   })
//   const page = await browser.newPage()
//   page.goto(url)
//   await page.waitForNavigation()
// }

// launch().catch(e => {})
