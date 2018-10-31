const R = require('ramda')
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const STR_REGEXP = /([+-]?)(?:([^+x-]+)?(?:x(?:\^([\d\/]+))?)|([^+x-]\s))/gi
const DIGITS_AFTER_POINT = 4

class Expression {
  constructor (exp, sign) {
    const exprRegx = /[^*/]+|[*/]/g
    const expression = exp.replace(' ', '')
    this.exp = expression.match(exprRegx)

    this.parseCoef()
    if (sign) {
      this.coef *= -1
      const number = this.exp[0].match(/[\d+]/g)
      number[0] *= -1
      this.exp[0] = String(number.join(''))
    }
    this.parsePower()
  }

  parseCoef () {
    const coef = parseFloat(this.exp[0].replace(' ', ''))
    this.coef = coef || 0
  }

  parsePower () {
    if (this.exp[2]) {
      const marchedStr = this.exp[2].replace(' ', '').match(/[0-9]/g)
    
      this.power = parseInt(R.pathOr(1, [0], marchedStr))
    } else {
      this.power = 0
    }
  }

}

const solveExpression = (expressions = []) => {
  const maxPower = expressions[0].power
  if (maxPower === 0) {
    if (expressions[0].coef === 0) {
      console.log("\x1b[32m", 'Every real is a solution')
    } else {
      console.log("\x1b[31m", "There is no solutions")
    }
  }
  else if (maxPower === 1) {
    console.log('Polynomial degree: 1')
    const result = -expressions[1].coef / expressions[0].coef
    console.log('\x1b[32m', 'The solution is: ', result.toFixed(DIGITS_AFTER_POINT))
  }
  else if (maxPower === 2) {
    console.log('Polynomial degree: 2')
    const getCoef = index => R.pathOr(0, [index, 'coef'], expressions)
    const a = parseFloat(getCoef(0))
    const b = parseFloat(getCoef(1))
    const c = parseFloat(getCoef(2))
    const descr = Math.pow(b, 2) - 4 * a * c

    if (descr > 0) {
      const x1 = (-b + Math.sqrt(descr)) / 2 * a
      const x2 = (-b - Math.sqrt(descr)) / 2 * a

      console.log("\x1b[35m", 'Discriminant is strictly positive, the two solutions are: ')
      console.log('\x1b[32m', 'X1: ', x1.toFixed(DIGITS_AFTER_POINT))
      console.log('\x1b[32m', 'X2: ', x2.toFixed(DIGITS_AFTER_POINT))
    } else if (descr === 0) {
      const x = -b / 2 * a
      console.log("\x1b[35m", 'Discriminant is equals to zero, the only solutions is: ')
      console.log('\x1b[32m', x.toFixed(DIGITS_AFTER_POINT))
    } else if (descr < 0) {
      console.log("\x1b[35m", 'Discriminant is negative, complex solution is: ')
      console.log(`${-b} ± i(${Math.sqrt(Math.abs(descr)).toFixed(DIGITS_AFTER_POINT)}) / ${2 * a}`)
    }
  }
}

const sortExpressionsByPower = (item1, item2) => item1.power > item2.power ? -1 : 1

const reduceExpressions = (expressions = []) => {
  if (!expressions) return

  const sortedExpressions = expressions.sort(sortExpressionsByPower)

  return sortedExpressions.reduce((acc, expretion) => {
    expressionsWithSamePower = acc.filter(item => item.power === expretion.power)

    const coef = expressionsWithSamePower.reduce((acc, item) => {
      return acc + parseFloat(`${item.coef}`)
    }, 0)

    if (expressionsWithSamePower.length === 0) return acc

    const restExpressions = R.difference(acc, expressionsWithSamePower)

    restExpressions.push(new Expression(`${coef}*X^${expressionsWithSamePower[0].power}`))
    return restExpressions
  }, expressions)
}

rl.question('Enter your polynomial: ', (answer) => {
  const parts = answer.split('=')
  const rightPart = parts[1].match(STR_REGEXP)
  const leftPart = parts[0].match(STR_REGEXP)

  const expressionsArray = []

  for (let i = 0; i < leftPart.length; i++) {
    expressionsArray.push(new Expression(leftPart[i]))
  }
  if (rightPart) {
    for (let j = 0; j < rightPart.length; j++) {
      expressionsArray.push(new Expression(rightPart[j], '-'))
    }
  }
  const itemsWithPowerGt2 = expressionsArray.filter(item => item.power > 2)
  if (itemsWithPowerGt2.length) {
    console.log(`Polynomial degree: ${R.path([0, 'power'], itemsWithPowerGt2)}`)
    console.log('The polynomial degree is stricly greater than 2, I can\'t solve.')
    rl.close()
    return
  }

  try {
    const reducedExpr = reduceExpressions(expressionsArray)
    let reduceStr = `${reducedExpr[0].exp.join(' ')} `
    for (let i = 1; i < reducedExpr.length; i++) {
      reduceStr += `${reducedExpr[i].coef >= 0 ? '+' : ''} ${reducedExpr[i].exp.join(' ')} `
    }
    console.log('\x1b[36m%s\x1b[0m', `Reduced form:  ${reduceStr}= 0`)
    solveExpression(reducedExpr)  
  } catch (error) {
    console.error('Unexpected format')
  }
  rl.close();
});