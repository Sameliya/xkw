// https://zujuan.xkw.com/xxsx/zsd163306/
// const axios = require('axios')
// const cheerio = require('cheerio')
const url = 'https://zujuan.xkw.com/xxsx/zsd163306/'

// const getData = async () => {
//   const res = await axios.get(url)
//   const data = res.data
//   console.log(res.data)
// }

// getData()
const fs = require('fs-extra')
const puppeteer = require('puppeteer')
const hrefMap = {}
async function launch() {
  const browser = await puppeteer.launch({
    headless: false,
  })
  const page = await browser.newPage()
  page.goto(url)
  await page.waitForNavigation()

  // const topTree = await page.$('body > main > aside > div > div.tree-box > div > ul')
  const res = await page.$eval('body > main > aside > div > div.tree-box > div > ul', el => {
    console.log(el)
    const map = {}
    const buildTree = (li, obj) => {
      if (li.children.length > 1) {
        const key = li.children[0].innerText.trim()
        const children = li.children[1].children
        obj[key] = {}

        Array.prototype.forEach.call(children, li => {
          buildTree(li, obj[key])
        })
      } else {
        // console.log(li.children[0].children[1].href)
        // obj[li.children[0].innerText] = li.children[0].innerText
        obj[li.children[0].innerText.trim()] = {
          url: li.children[0].children[1].href,
          questions: [],
        }
        // obj.href = li.children[0].href
      }
    }
    Array.prototype.forEach.call(el.children, li => {
      buildTree(li, map)
    })
    console.log(map)

    return map
  })
  console.log(res)
  fs.writeFileSync('./user.json', JSON.stringify(res));
  // await browser.close();
}

launch().catch(e => {})
