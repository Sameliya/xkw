const fs = require('fs-extra')
const puppeteer = require('puppeteer')

let map = fs.readFileSync('./user.json')
map = JSON.parse(map)

const missionTask = []

async function launch() {
  try {
    const browser = await puppeteer.launch({
      headless: false,
    })
    const craw = async obj => {
      if (!('url' in obj)) {
        Object.keys(obj).forEach(key => {
          craw(obj[key])
        })
      } else {
        missionTask.push(obj)
      }
    }
    craw(map)
    const handleMission = async (page, url, obj) => {
      await page.goto(url)
      await page.setDefaultNavigationTimeout(0); 
      // await page.waitForNavigation()

      obj.questions.push(
        await page.$eval('section.test-list', el => {
          console.log(el)
          const questions = []
          Array.prototype.forEach.call(el.children, child => {
            if (!child.querySelector('.exam-item__cnt')) return
            const question = child.querySelector('.exam-item__cnt').innerText.trim()
            const knowledge = child.querySelector('.knowledge-list').innerText.trim()
            if (question && knowledge)
              questions.push({
                question,
                knowledge,
              })
          })
          return questions
        })
      )
      let index = 2
      const loop = async url => {
        const fix = url + `02p${index}`
        await page.goto(fix)
        const u = page.url()
        if (u.includes(`/02p${index}`)) {
          obj.questions.push(
            await page.$eval('section.test-list', el => {
              console.log(el)
              const questions = []
              Array.prototype.forEach.call(el.children, child => {
                if (!child.querySelector('.exam-item__cnt')) return
                const question = child.querySelector('.exam-item__cnt').innerText.trim()
                const knowledge = child.querySelector('.knowledge-list').innerText.trim()
                if (question && knowledge)
                  questions.push({
                    question,
                    knowledge,
                  })
              })
              return questions
            })
          )
          index++
          await loop(url)
        } else page.close()
      }
      await loop(url)
    }

    const handleTaskList = async () => {
      let index = 0
      while (missionTask.length !== index) {
        const promiseArr = []
        for (let i = 0; i <= 10 && missionTask.length !== index; i++) {
          const task = async index => {
            const page = await browser.newPage()
            await page.goto(missionTask[index].url)
            await handleMission(page, missionTask[index].url, missionTask[index])
          }
          promiseArr.push(task(index))
          index++
        }
        await Promise.all(promiseArr)
      }
    }
    handleTaskList()
    fs.writeFileSync('./tasklist.json', JSON.stringify(map))
  } catch (e) {
    fs.writeFileSync('./tasklist.json', JSON.stringify(map))
  }
}

launch().catch(e => {})
