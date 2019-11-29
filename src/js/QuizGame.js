import { QuizQuestion } from './QuizQuestion.js'
import { storeHighScore, generateHighScoreFragment } from './highScore.js'

/**
* Class for Quiz game, creating a new 
* HTML element to insert on any page
*/
class QuizGame extends HTMLElement {

  /**
   * Constructor for QuizGame element
   */
  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    this.template = document.querySelector('#gameCard').cloneNode(true).content
    this.canvas = this.template.querySelector('#gameCanvas')

    this.styleLink = document.createElement('link')
    this.styleLink.setAttribute('rel', 'stylesheet')
    this.styleLink.setAttribute(
      'href',
      'https://cdn.jsdelivr.net/npm/bulma@0.8.0/css/bulma.min.css'
    )

    this.totalTime = 0
  }

  /**
   * Append the template to shadow
   * and then prompt the user for a nickname
   */
  connectedCallback () {
    this.shadow.append(this.template)
    this.shadow.append(this.styleLink)

    this.getNicknameToStart()
  }

  /**
   * Prompts user for nickname in order to start game
   */
  getNicknameToStart () {
    const startGame = document.querySelector('#startGame').cloneNode(true)
      .content
    this.canvas.append(startGame)
    this.canvas
      .querySelector('#nicknameForm')
      .addEventListener('submit', this.validateAndStart.bind(this))
  }

  /**
   * Validate user input and then start game
   * @param  {Event} event
   */
  validateAndStart (event) {
    event.preventDefault()
    this.nickName = event.target.querySelector('#nickname').value
    if (this.nickName.length === 0) {
      event.target.querySelector('#nickname').classList.add('is-danger')
    } else {
      this.nextQuestion('http://vhost3.lnu.se:20080/question/1')
    }
  }

  /**
   * @param  {string} url to the desired question
   */
  async nextQuestion (url) {
    clearInterval(this.countDown)
    const roundData = await this.fetchQuestion(url)
    this.currentQuestion = roundData
    this.updateQuestionRendering(roundData)
    this.timeRound(20)
  }

  /**
   * @param  {string} url
   * @returns {QuizQuestion}
   */
  async fetchQuestion (url) {
    return new QuizQuestion(url)
  }

  /**
   * Updates the DOM with question data for this round
   * @param  {QuizQuestion} roundData
   */
  async updateQuestionRendering (roundData) {
    this.canvas.innerHTML = ''

    const questionFragment = document.createDocumentFragment()
    const questionHeadline = document.createElement('h1')
    questionHeadline.textContent = await roundData.question
    questionFragment.appendChild(questionHeadline)

    const alternatives = await roundData.alternatives

    if (alternatives) {
      const form = document
        .querySelector('#alternativeQuestionForm')
        .cloneNode(true).content
      const alternatives = roundData.alternatives
      const radioButton = form.querySelector('#radioButtonTemplate')

      for (const item in alternatives) {
        const answerRadio = radioButton.cloneNode(true)
        const label = answerRadio.querySelector('label')
        const button = answerRadio.querySelector('input')

        label.textContent = alternatives[item]
        label.setAttribute('for', item)

        button.setAttribute('id', item)
        button.value = item

        radioButton.before(answerRadio)
      }
      radioButton.remove()
      questionFragment.appendChild(form)
    } else {
      const form = document.querySelector('#textQuestion').cloneNode(true)
        .content
      questionFragment.appendChild(form)
    }
    this.canvas.appendChild(questionFragment)

    this.canvas
      .querySelector('form')
      .addEventListener('submit', async event => {
        event.preventDefault()
        let answer
        if (alternatives) {
          answer = this.canvas.querySelector('input:checked').value
        } else {
          answer = this.canvas.querySelector('#answerText').value
        }
        const result = await roundData.sendAnswer(answer)
        this.handleResult(result)
      })
  }
  
  /**
   * "Routes" the player depending on
   * if they are correct or wrong
   * @param  {string} result
   */
  handleResult (result) {
    if (result.message === 'Correct answer!') {
      if (result.nextURL) {
        this.nextQuestion(result.nextURL)
      } else {
        this.winGame()
        console.log('You WON!')
      }
    } else {
      this.failGame()
    }
  }

  /**
   * Executed if the player wins
   */
  winGame () {
    clearInterval(this.countDown)
    storeHighScore(this.nickName, this.totalTime)

    const fragment = document.createDocumentFragment()
    const headline = document.createElement('h3')
    headline.textContent = 'You win!'
    fragment.appendChild(headline)
    const highScoreFragment = generateHighScoreFragment(5, 'highScore')
    fragment.appendChild(highScoreFragment)
    this.canvas.innerHTML = ''
    this.canvas.append(fragment)

    this.shadow.querySelector('#timer').textContent = 'You are the champion!'
  }

  /**
   * Executed if the player fails
   */
  failGame () {
    clearInterval(this.countDown)
    const fragment = document.createDocumentFragment()

    const headline = document.createElement('h3')
    headline.textContent = 'You lose!'
    const restartButton = document.createElement('button')
    restartButton.setAttribute('class', 'button is-danger')
    restartButton.textContent = 'Give it another shot...'

    fragment.appendChild(headline)
    fragment.appendChild(restartButton)
    this.canvas.innerHTML = ''
    this.canvas.append(fragment)

    this.shadow.querySelector('#timer').textContent = 'You are the loser!'

    this.restartButton = restartButton
    this.restartButton.addEventListener('click', event => location.reload())
  }

  /**
   * Start timer for each round, fails the game
   * if limit is reached
   * @param  {number} timeLimit
   */
  async timeRound (timeLimit) {
    const timerText = this.shadow.querySelector('#timer')

    let roundTime = 20
    timerText.textContent = roundTime
    this.countDown = setInterval(() => {
      roundTime--
      timerText.textContent = roundTime
      this.totalTime++
      if (roundTime === 0) {
        this.failGame()
      }
    }, 1000)
  }
}
customElements.define('quiz-game', QuizGame)
export { QuizGame }
