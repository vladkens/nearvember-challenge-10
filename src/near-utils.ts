import { connect, Contract, keyStores, WalletConnection } from 'near-api-js'
import { api } from './api'

declare global {
  interface Window {
    walletConnection: WalletConnection
    contract: Contract
    accountId: string
  }
}

// const NODE_ENV = process.env.NODE_ENV || 'development'
// const CONTRACT_NAME = process.env.CONTRACT_NAME || 'challenge-7.vladkens.testnet'

const NODE_ENV = 'development'
const CONTRACT_NAME = api.contractName

export function getConfig(env: string) {
  switch (env) {
    case 'production':
    case 'mainnet':
      return {
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        contractName: CONTRACT_NAME,
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org',
        explorerUrl: 'https://explorer.mainnet.near.org',
      }
    case 'development':
    case 'testnet':
      return {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        contractName: CONTRACT_NAME,
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org',
      }
    case 'betanet':
      return {
        networkId: 'betanet',
        nodeUrl: 'https://rpc.betanet.near.org',
        contractName: CONTRACT_NAME,
        walletUrl: 'https://wallet.betanet.near.org',
        helperUrl: 'https://helper.betanet.near.org',
        explorerUrl: 'https://explorer.betanet.near.org',
      }
    case 'local':
      return {
        networkId: 'local',
        nodeUrl: 'http://localhost:3030',
        keyPath: `${process.env.HOME}/.near/validator_key.json`,
        walletUrl: 'http://localhost:4000/wallet',
        contractName: CONTRACT_NAME,
      }
    case 'test':
    case 'ci':
      return {
        networkId: 'shared-test',
        nodeUrl: 'https://rpc.ci-testnet.near.org',
        contractName: CONTRACT_NAME,
        masterAccount: 'test.near',
      }
    case 'ci-betanet':
      return {
        networkId: 'shared-test-staging',
        nodeUrl: 'https://rpc.ci-betanet.near.org',
        contractName: CONTRACT_NAME,
        masterAccount: 'test.near',
      }
    default:
      throw Error(
        `Unconfigured environment '${env}'. Can be configured in src/config.js.`
      )
  }
}

const nearConfig = getConfig(NODE_ENV)
console.log(nearConfig)

export async function initContract() {
  const near = await connect({
    deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() },
    ...nearConfig,
  })

  const viewMethods = Object.keys(api._views)
  const changeMethods = Object.keys(api._calls)

  const walletConnection = new WalletConnection(near, null)
  const contract = await new Contract(
    walletConnection.account(),
    nearConfig.contractName,
    { viewMethods, changeMethods }
  )

  const accountId = walletConnection.getAccountId()

  window.walletConnection = walletConnection
  window.contract = contract
  window.accountId = accountId
}
