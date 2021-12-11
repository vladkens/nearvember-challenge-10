import { BanIcon } from '@heroicons/react/solid'
import { Suspense, useEffect, useState } from 'react'
import {
  AlertComponentPropsWithStyle,
  positions,
  Provider as AlertProvider,
  transitions,
  useAlert,
} from 'react-alert'
import FlipMove from 'react-flip-move'
import ReactMarkdown from 'react-markdown'
import { HashRouter as Router, Link, Route, Routes } from 'react-router-dom'
import { api, Challenge, ScoreTO } from './api'
import NearLogo from './assets/logo-white.svg'

const Login: React.FC = () => {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="text-center hero-content">
        <div className="max-w-lg">
          <h1 className="mb-5 text-5xl font-bold">
            Welcome to
            <br />
            <a
              href="https://twitter.com/hashtag/NEARvember"
              target="_blank"
              className="text-red-400 rounded px-1 hover:underline"
            >
              #NEARvember
            </a>
            !
          </h1>
          <p className="mb-5 text-2xl">
            This is Challenge 10 app.
            <br />
          </p>
          <button className="btn btn-primary" onClick={api.login}>
            Get Started
          </button>
        </div>
      </div>
    </div>
  )
}

const Header: React.FC = () => {
  return (
    <div
      className="navbar mb-2 shadow-lg bg-neutral text-neutral-content
flex justify-between items-center text-lg"
    >
      <div>
        <div className="w-12 h-12 mr-2">
          <NearLogo />
        </div>
        Hi,&nbsp;
        <span className="font-bold">{window.accountId}</span>!
        <div className="ml-5">
          <Link
            to="/"
            className="mx-5 border-b-2 border-yellow-300 border-solid font-semibold"
          >
            Leaderboard
          </Link>
          <Link
            to="/create"
            className="mx-5 border-b-2 border-yellow-300 border-solid font-semibold"
          >
            Create challenge
          </Link>
          <Link
            to="/admin"
            className="mx-5 border-b-2 border-yellow-300 border-solid font-semibold"
          >
            Claim admin
          </Link>
        </div>
      </div>
      <div className="">
        <button className="btn btn-link text-white ml-2" onClick={api.logout}>
          Logout
        </button>
      </div>
    </div>
  )
}

type ChallengeCardProps = { data: Challenge; number: number }

const ChallengeCard: React.FC<ChallengeCardProps> = ({ data, number }) => {
  console.log(data)
  return (
    <div className="card lg:card-side bordered shadow-2xl bg-white max-w-4xl my-2 w-full">
      <div className="card-body">
        <div className="flex flex-row justify-between items-around">
          <h2 className="card-title">
            Challenge #{number}. {data.title}
          </h2>
          <div className="badge mx-2 my-0.5 badge-accent badge-lg w-48">
            {data.participants.length} competitors
          </div>
        </div>
        <div>
          <ReactMarkdown className="challenge-card">
            {data.description.replace(/\n/gi, '\n\n')}
            {/* {data.description} */}
          </ReactMarkdown>
        </div>
        <h3 className="font-semibold text-lg">How to win</h3>
        <div>
          {/* {data.tasks.map((x) => ( */}
          {/* <li>{x}</li> */}
          {/* ))} */}
        </div>
        <div className="card-actions">
          <button className="btn btn-primary">Save</button>
        </div>
      </div>
    </div>
  )
}

type LeaderboardProps = {}

const getPlaceIcon = (place: number) => {
  let placeIcons: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }
  if (place in placeIcons) {
    return <span className="text-3xl leading-none">{placeIcons[place]}</span>
  }

  return place.toString()
}

type CreateChallengeProps = {}

const CreateChallenge: React.FC<CreateChallengeProps> = () => {
  return (
    <div>
      <div className="form-control w-full my-5">
        <label className="input-group w-full">
          <span className="w-64 flex items-center justify-center uppercase leading-10 font-5xl">
            title
          </span>
          <input type="text" className="input input-bordered w-full" />
        </label>
      </div>
      <div className="form-control w-full my-5">
        <label className="input-group w-full">
          <span className="w-64 flex items-center justify-center uppercase leading-10 font-5xl">
            title
          </span>
          <input type="text" className="input input-bordered w-full" />
        </label>
      </div>
    </div>
  )
}

const Leaderboard: React.FC<LeaderboardProps> = () => {
  const [state, setState] = useState<ScoreTO[]>([])

  useEffect(() => {
    api.scores().then(setState)
  }, [])

  console.log(state)

  return (
    <table className="table w-full">
      <thead>
        <tr>
          <th className="text-center">Place</th>
          <th className="text-center">Competitor</th>
          <th className="text-center">Score</th>
          <th className="md:w-48"></th>
        </tr>
      </thead>
      <FlipMove className="table-row-group">
        {state.map((x, idx) => (
          <tr key={x[0]} className="bg-base-100 even:bg-base-200">
            <th className="text-center font-normal">{getPlaceIcon(idx + 1)}</th>
            <td className="text-center">{x[0]}</td>
            <td className="text-center font-bold">{x[1]}</td>
            <td className="flex justify-center md:w-48"></td>
          </tr>
        ))}
      </FlipMove>
    </table>
  )
}

const Main: React.FC = () => {
  const alert = useAlert()
  const [state, setState] = useState<Challenge[]>([])

  useEffect(() => {
    api.get_challenges().then(setState)
  }, [])

  //   <div>
  //   <Header />
  //   <div className="flex flex-col justify-center items-center px-4">
  //     <Leaderboard data={state} />
  //     {/* {state.map((x, idx) => (
  //       <ChallengeCard key={x.id} data={x} number={idx + 1} />
  //     ))} */}
  //   </div>
  // </div>

  return (
    <div>
      <Header />
      <div className="flex justify-center mt-5 mb-10">
        <div className="max-w-4xl w-full">
          <Routes>
            <Route path="/" element={<Leaderboard />}></Route>
            <Route path="/create" element={<CreateChallenge />}></Route>
          </Routes>
        </div>
      </div>
    </div>
  )
}

const App: React.FC = () => {
  const options = {
    position: positions.TOP_RIGHT,
    timeout: 5000,
    transition: transitions.SCALE,
    // offset: '76px 10px',
  }

  return (
    <AlertProvider template={Alert} {...options}>
      <Suspense fallback="Loading...">
        <Router>
          {!window.walletConnection.isSignedIn() ? <Login /> : <Main />}
        </Router>
      </Suspense>
    </AlertProvider>
  )
}

const Alert: React.FC<AlertComponentPropsWithStyle> = ({
  style,
  message,
  close,
}) => {
  return (
    <div className="alert alert-error justify-start" style={style}>
      <BanIcon className="w-6 mr-2" />
      <label>{message}</label>
    </div>
  )
}

export default App
