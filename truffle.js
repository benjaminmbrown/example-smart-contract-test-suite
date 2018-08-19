// Allows us to use ES6 in our migrations and tests.
require('babel-register')
module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*'
     // gas: 9000000
    },
    //run estimate_deployment.js to get proper numbers
    //see https://ethereum.stackexchange.com/questions/40155/what-should-be-the-gas-and-gasprice-for-ropsten-network-in-truffle-config
    // ropsten: {
    //   provider: ropstenProvider,
    //   gas: 266000,
    //   gasPrice: web3.toWei("50", "gwei"),
    //   network_id: "3"
    // }
  }
}
