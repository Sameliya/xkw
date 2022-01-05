const fs = require('fs-extra')
const puppeteer = require('puppeteer')

let map = fs.readFileSync('./tasklist.json')
map = JSON.parse(map)

const missionTask = []

async function launch() {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      // args: ['--proxy-server=http://183.173.16.47:7890'],
    })
    const craw = async obj => {
      if (!obj.questions) {
        Object.keys(obj).forEach(key => {
          craw(obj[key])
        })
      } else {
        if (obj.questions.length === 0) missionTask.push(obj)
      }
    }
    craw(map)
    const handleMission = async (page, url, obj) => {
      await page.goto(url)
      const questions = []
      questions.push(
        await page.$eval('section.test-list', el => {
          const questions = []
          Array.prototype.forEach.call(el.children, child => {
            if (!child.querySelector('.exam-item__cnt')) return
            const question = child.querySelector('.exam-item__cnt').innerText.trim()
            const knowledge = child.querySelector('.knowledge-list').innerText.trim()
            const img = child.querySelector('img')
            if (question && knowledge && !img)
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
          questions.push(
            await page.$eval('section.test-list', el => {
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
        } else {
          const title = await page.title()
          if (title !== '禁止访问') {
            console.log(1)
            obj.questions = questions
            fs.writeFileSync('./tasklist.json', JSON.stringify(map))
          }
          await page.close()
        }
      }
      try {
        await loop(url)
      } catch (e) {
        await page.close()
      }
    }

    const handleTaskList = async () => {
      let index = 0
      while (missionTask.length !== index) {
        const promiseArr = []
        for (let i = 0; i <= 2 && missionTask.length !== index; i++) {
          const task = async index => {
            const page = await browser.newPage()
            await page.goto(missionTask[index].url)
            await handleMission(page, missionTask[index].url, missionTask[index])
          }
          promiseArr.push(task(index))
          index++
        }
        // try {
          await Promise.all(promiseArr)
        // } catch (error) {
          // console.log(2)
        // }
      }
    }
    handleTaskList()
    fs.writeFileSync('./tasklist.json', JSON.stringify(map))
  } catch (e) {
    console.log(1)
    fs.writeFileSync('./tasklist.json', JSON.stringify(map))
  }
}

launch().catch(e => {
  console.log(1)
  console.log(e)
})
