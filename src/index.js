const { isDevelopmentNetwork, executeTest } = require('./truffle-helper')
const { GanacheWrapper } = require('./ganache-wrapper')

/**
 * Starts ganache-core as server before running truffle test, if it is not running
 * @param config - A truffle-config object.
 * Has attributes like `truffle_directory`, `working_directory`, etc.
 * @param done - A done callback, or a normal callback.
 */
module.exports = async (config, done) => {
  // if network is not set as parameter, network development is chosen by truffle
  if (!config.network) {
    config.network = 'development'
  }

  let ganacheStartedByPlugin = false
  const network = config.networks[config.network]

  const ganache = new GanacheWrapper(network.host, network.port)
  const isGanacheRunning = await ganache.isRunning()

  if (isDevelopmentNetwork(config.network) && !isGanacheRunning) {
    await ganache.start(mapTruffleConfigToGanacheConfig(config))
    ganacheStartedByPlugin = true
  }

  await executeTest(config._.slice(1))

  if (ganacheStartedByPlugin) {
    ganache.stop()
  }

  done()
}

function mapTruffleConfigToGanacheConfig (truffleConfig) {
  const truffleNetworkConfig = Object.entries(truffleConfig.network_config)

  return truffleNetworkConfig.reduce((ganacheConfig, setting) => {
    const key = setting[0]
    const value = setting[1]

    switch (key) {
      case 'gas':
        ganacheConfig['gasLimit'] = value
        break
      case 'network_id':
        if (value !== '*') {
          ganacheConfig[key] = value
        }
        break
      default:
        if (value) {
          ganacheConfig[key] = value
        }
    }

    return ganacheConfig
  }, {})

  // return {
  //   allowUnlimitedContractSize: network.hasOwnProperty('allowUnlimitedContractSize') ? network.allowUnlimitedContractSize : null,
  //   default_balance_ether: network.hasOwnProperty('defaultBalance') ? parseInt(network.defaultBalance) : null,
  //   gasLimit: network.gas,
  //   gasPrice: network.gasPrice,
  //   hardfork: network.hasOwnProperty('hardfork') ? network.hardfork : null,
  //   locked: network.hasOwnProperty('locked') ? network.locked : null,
  //   mnemonic: network.hasOwnProperty('mnemonic') ? network.mnemonic : null,
  //   network_id: network.network_id === '*' ? null : parseInt(network.network_id),
  //   total_accounts: network.hasOwnProperty('totalAccounts') ? parseInt(network.totalAccounts) : null
  // }
}
