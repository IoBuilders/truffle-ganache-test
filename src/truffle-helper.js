const { spawn } = require('child_process')
const which = require('npm-which')(__dirname)

const truffleBinary = which.sync('truffle')

async function executeTest (testFiles) {
  return new Promise((resolve, reject) => {
    const truffleTest = spawn(truffleBinary, ['test'].concat(testFiles), { shell: true })

    truffleTest.stdout.on('data', (data) => {
      process.stdout.write(data.toString())
    })

    truffleTest.stderr.on('data', (data) => {
      const msg = `Error while running truffle test: ${data}`
      console.error(msg)
      reject(new Error(msg))
    })

    truffleTest.on('close', (code) => {
      resolve(code)
    })
  })
}

function isDevelopmentNetwork (network) {
  return network === 'development'
}

module.exports = {
  executeTest,
  isDevelopmentNetwork
}
