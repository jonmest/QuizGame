/**
 * Stores the players score in a high-score list. 
 * If it doesn't exist it is created.
 * @param  {string} nickname
 * @param  {number} time
 * 
 */
function storeHighScore (nickname, time) {
  if (localStorage.getItem('highScore')) {
    const highScoreArray = JSON.parse(localStorage.getItem('highScore'))
    highScoreArray.push({ player: nickname, time: time })
    localStorage.setItem('highScore', JSON.stringify(highScoreArray))
  } else {
    const highScore = [{ player: nickname, time: time }]
    localStorage.setItem('highScore', JSON.stringify(highScore))
  }
}
/**
 * Generates a fragment containing an ordered list of high-schore players
 * stored in local storage
 * @param  {number} nLimit how many high-scorers to include
 * @param  {string} itemName the name of the list in local storage
 * @returns {DocumentFragment}
 */
function generateHighScoreFragment (nLimit, itemName) {
  const highScore = JSON.parse(localStorage.getItem(itemName))
  const highScoreFragment = document.createDocumentFragment()
  const ol = document.createElement('ol')

  const topTalents = highScore.sort((a, b) => a.time - b.time).slice(0, nLimit)

  topTalents.forEach(item => {
    const li = document.createElement('li')
    li.textContent = `Player: ${item.player} - Time: ${item.time}`
    ol.appendChild(li)
  })

  return highScoreFragment.appendChild(ol)
}

export { storeHighScore, generateHighScoreFragment }
