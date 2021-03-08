import { loadImage } from './loadImage.js'

const canvas = document.createElement('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const context = canvas.getContext('2d')

document.body.appendChild(canvas)

const NUMBER_OF_HURDLES_PER_LEVEL = 30

const HURDLE_WIDTH = 20
const HURDLE_HEIGHT = 30
const PONY_WIDTH = 60
const PONY_HEIGHT = 40
const JUMP_HEIGHT = HURDLE_HEIGHT + 10
const JUMP_STAY_AT_HIGHEST_POINT_DURATION = 1500  // ms

let jumpStart = null
let jumpAtHighestPointStart = null
let jumpOffset = 0
let jumpUp = false

class Level {
  constructor(hurdles) {
    this.hurdles = hurdles
  }
}

class Hurdle {
  constructor({x, y}) {
    this.x = x
    this.y = y
  }
}

class Pony {
  constructor({x, y}) {
    this.x = x
    this.y = y
  }
}

let ponySprite = null
let hurdleSprite = null

const groundLevel = 0.8 * canvas.height
const level = generateLevel()
const pony = new Pony({x: 0, y: groundLevel - PONY_HEIGHT})

async function render() {
  clearCanvas()
  renderGround()
  context.save()
  context.translate(0.5 * canvas.width - pony.x, 0)
  await renderLevel(level)
  await renderPony(pony)
  context.restore()
}

function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height)
}

async function renderLevel(level) {
  await renderHurdles(level.hurdles)
}

function renderGround() {
  context.fillRect(0, groundLevel, canvas.width, 1)
}

async function renderHurdles(hurdles) {
  for (const hurdle of hurdles) {
    await renderHurdle(hurdle)
  }
}

async function renderPony({x, y}) {
  if (!ponySprite) {
    ponySprite = await loadImage('images/pony.png')
  }
  context.drawImage(
    ponySprite,
    x,
    y + jumpOffset,
    PONY_WIDTH,
    (PONY_WIDTH / ponySprite.naturalWidth) * ponySprite.naturalHeight
  )
}

async function renderHurdle({x, y}) {
  if (!hurdleSprite) {
    hurdleSprite = await loadImage('images/hurdle.png')
  }
  context.drawImage(hurdleSprite, x, y, HURDLE_WIDTH, HURDLE_HEIGHT)
}

async function onTick() {
  pony.x += 1
  if (jumpStart) {
    if (jumpAtHighestPointStart && (new Date() - jumpAtHighestPointStart) <= JUMP_STAY_AT_HIGHEST_POINT_DURATION) {

    } else {
      if (jumpAtHighestPointStart && (new Date() - jumpAtHighestPointStart) > JUMP_STAY_AT_HIGHEST_POINT_DURATION) {
        jumpAtHighestPointStart = null
        jumpUp = false
      }
      if (jumpUp) {
        jumpOffset -= 1
        if (jumpOffset <= -JUMP_HEIGHT) {
          jumpAtHighestPointStart = new Date()
        }
      } else {
        jumpOffset += 1
        if (jumpOffset >= 0) {
          resetJump()
        }
      }
    }
  }
  await render()
  scheduleNextTick()
}

function scheduleNextTick() {
  requestAnimationFrame(onTick)
}

scheduleNextTick()

function generateLevel() {
  const hurdles = generateHurdles(NUMBER_OF_HURDLES_PER_LEVEL)
  return new Level(hurdles)
}

function generateHurdles(amount) {
  const hurdles = []
  let x = 3 * PONY_WIDTH
  for (let index = 0; index < amount; index++) {
    hurdles.push(generateHurdle(x))
    const minDistance = 3 * PONY_WIDTH
    x += randomInteger(minDistance, minDistance + 100)
  }
  return hurdles
}

function randomInteger(min, max) {
  min = Math.floor(min)
  max = Math.floor(max)
  return min + Math.floor(Math.random() * (max - min))
}

function generateHurdle(x) {
  return new Hurdle({x, y: groundLevel - HURDLE_HEIGHT})
}

window.addEventListener('keydown', function (event) {
  if (event.code === 'Space') {
    event.preventDefault()
    if (!jumpStart) {
      jump()
    }
  }
})

function jump() {
  jumpStart = new Date()
  jumpAtHighestPointStart = null
  jumpOffset = 0
  jumpUp = true
}

function resetJump() {
  jumpStart = null
  jumpAtHighestPointStart = null
  jumpOffset = 0
  jumpUp = null
}
