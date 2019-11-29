/**
* Class for quiz questions containing some
* useful methods for fetching and answering
*/
class QuizQuestion {
  
  /**
   * Constructor for a question object
   * @param  {string} url
   */
  constructor (url) {
    this.questionUrl = url
    this.question = this.getQuestion()
    this.answerUrl
    this.response
    this.alternatives
  }
  /**
   * @returns {string} question itself
   */
  async getQuestion () {
    const response = await fetch(this.questionUrl)
    const responseBody = await response.json()
    if (responseBody.alternatives) {
      this.alternatives = responseBody.alternatives
    }
    this.answerUrl = responseBody.nextURL
    return responseBody.question
  }
  /**
   * Send answer to question, return result in JSON
   * @param  {string} answerString
   * @returns {JSON}
   */
  async sendAnswer (answerString) {
    const response = await fetch(this.answerUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ answer: answerString })
    })
    const responseBody = await response.json()
    return responseBody
  }
}

export { QuizQuestion }
