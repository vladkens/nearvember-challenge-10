const contractName = 'nov.challenges.testnet'

type PrizeTO = {
  title: string
  max_winners: number
  winners: number[]
  points: number
}

type ChallengeTO = {
  title: string
  description: string
  prizes: Record<string, PrizeTO>
}

type StateTO = [id: string, data: ChallengeTO][]

export type ScoreTO = [name: string, score: number]

export type Challenge = {
  id: string
  title: string
  description: string
  prizes: Record<string, PrizeTO>
  participants: number[]
}

const views = {
  async get_challenges() {
    // @ts-expect-error
    const to = (await window.contract.get_challenges()) as StateTO
    console.log(to)

    const challenges: Challenge[] = []
    for (let el of to) {
      let [id, obj] = el
      let participants: number[] = []
      for (let x of Object.values(obj.prizes)) {
        participants = [...participants, ...x.winners]
      }
      participants = Array.from(new Set(participants))
      challenges.push({ id, ...obj, participants })
    }

    return challenges
  },

  async scores() {
    // @ts-expect-error
    const to = (await window.contract.scores()) as ScoreTO[]
    return to
  },
}

const calls = {}

export const api = {
  contractName,
  ...views,
  ...calls,

  _views: views,
  _calls: calls,

  login() {
    window.walletConnection.requestSignIn(contractName)
  },

  logout() {
    window.walletConnection.signOut()
    window.location.replace(window.location.origin + window.location.pathname)
  },
}
