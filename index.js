const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var STR_REGEXP = /([+-]?)(?:([^+x-]+)?(?:x(?:\^([\d\/]+))?)|([^+x-]+))/g

function parseExp(sgn, exp) {

exp = String(exp).match(/[^*/]+|[*/]/g)

var num = FIELD['parse'](sgn + exp[0])

for (var i = 1; i < exp.length; i += 2) {

  if (exp[i] === '*') {
    num = FIELD['mul'](num, FIELD['parse'](exp[i + 1] || 1))
  } else if (exp[i] === '/') {
    num = FIELD['div'](num, FIELD['parse'](exp[i + 1] || 1))
  }
}
return num
}

rl.question('What do you think of Node.js? ', (answer) => {
  // TODO: Log the answer in a database
  console.log(`Thank you for your valuable feedback: ${answer}`)

  rl.close();
});