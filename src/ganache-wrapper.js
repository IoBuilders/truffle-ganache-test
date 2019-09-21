const ganache = require('ganache-core')
const portScanner = require('portscanner')
const { sleep } = require('./utils')

class GanacheWrapper {
  constructor (hostname, port) {
    this.hostname = hostname
    this.port = port
  }

  async isRunning () {
    const portStatus = await portScanner.checkPortStatus(
      this.port,
      this.hostname
    )

    return portStatus === 'open'
  }

  async start (config) {
    this.server = ganache.server(config)
    this.server.listen(this.port, this.hostname, function (err) {
      if (err) {
        console.error(err)
      }
    })

    while (true) {
      const isRunning = await this.isRunning()
      if (isRunning) {
        break
      }

      await sleep(100)
    }
  }

  stop () {
    this.server.close()
  }
}

module.exports.GanacheWrapper = GanacheWrapper
