#!/usr/bin/env python

import json
import os
import re
import subprocess
from collections import defaultdict
from typing import TypedDict


def near_call(func, data):
    func = func.encode('utf-8')
    env = load_env()
    arg = json.dumps(data).encode('utf-8')
    arg = arg.replace(b"'", b"\u0027")
    cmd = b"near call $CN %s '%s' --accountId $CN --gas 300000000000000" % (
        func, arg)
    print(arg)
    return

    proc = 0
    proc = subprocess.call(cmd, env=env, shell=True, executable='/bin/bash')
    if proc != 0:
        print('\n', arg)
        exit()


def chunks(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i:i + n]


CUR_DIR = os.path.dirname(__file__)

datapath = os.path.abspath(os.path.join(CUR_DIR, '../data'))
results = defaultdict()
for file in os.listdir(datapath):
    with open(os.path.join(datapath, file)) as fp:
        data = defaultdict(list)
        results[int(file.removesuffix('.txt'))] = data
        group = 'prizes'
        for x in [x.strip() for x in fp.read().split('\n') if x]:
            if x.startswith('='):
                group = x.removeprefix('=').strip()
                if group == 'winners':
                    group = 'baseline'
                continue

            if group == 'prizes':
                x = [x for x in x.split(' ') if x]
                if len(x) == 3:
                    data['prizes'].append((x[0], int(x[1]), int(x[2])))
                if len(x) == 2:
                    data['prizes'].append((x[0], int(x[1]), 0))
                continue

            x = x.lower().removeprefix('@').removesuffix('?').removesuffix('+').strip()
            data[group].append(x)

        for x in [x for x in data.keys() if x != 'prizes']:
            data[x] = list(set(data[x]))


class Prize(TypedDict):
    pass


class Task(TypedDict):
    title: str
    description: str
    tasks: list[str]
    prizes: list[Prize]


tasks: list[Task] = [
    # task 1
    {
        'title': 'Mint an NFT on NEAR',
        'description': 'For the first challenge, deploy an NFT smart contract and mint an NFT. This is easier than you think - just have a look at our docs!',
        'tasks': [
            'Deploy an NFT smart contract on the testnet',
            'Mint an NFT',
            'Share the command on the Discord channel #nearvember for us to view all NFTs owned by you',
        ],
        'prizes': []
    },
    # task 2
    {
        'title': 'Write a Hello World smart contract',
        'description': 'Create a Hello World smart contract with the Rust SDK. If you\'re not sure where to get started, have a look [here](https://www.near-sdk.io/). And if you’re brand new to Rust, check out our [quick-start guide](https://docs.near.org/docs/develop/contracts/rust/intro). When we call the contract, it should take a {name} parameter and return "Hello {name}!"',
        'tasks': [
            'Deploy your Hello World smart contract on the testnet',
            'Share the command on the Discord channel #nearvember for us to call',
        ],
        'prizes': []
    },
    # task 3
    {
        'title': 'Build a simple frontend for your Hello World contract',
        'description': '''
With the Hello World contract you deployed previously, build a frontend.
The user should enter their name, call the contract, and see "Hello {name}!"
It can be as simple or complex as you like!

If you didn't complete yesterday's task, you can use our contract:

Deployed [here](https://explorer.testnet.near.org/transactions/5Gg7p2ohtpucZYUVGMavYcxbJmBD9G7CLvWN8Np7GBKq)
[GitHub link](https://github.com/doriancrutcher/Near-Rust-Hello-World)
CLI: `near call nearvember.testnet set_name '{"name": "Cat"}' --accountId YOUR_ACCOUNT_ID`
''',
        'tasks': [
            'Deploy your frontend anywhere (GitHub Pages is the most simple option)',
            'Share the link on the Discord channel #nearvember for us to test'
        ],
        'prizes': []
    },
    # task 4
    {
        'title': 'Modify and deploy the guest book example!',
        'description': '''
Add some modifications to the Guest Book example smart contract AND frontend, and deploy it.
Clone the [repository](https://examples.near.org/guest-book) for the Guest Book example
Modify the example to display the date and time someone signed it. Deploy the contract on a testnet sub-account
Change the styling to make it your own.
Deploy the smart contract and the frontend (default in the code is GitHub Pages).
It can be as simple or complex as you like!
        ''',
        'tasks': [
            'Deploy your project',
            'Get at least one person to sign your guest book',
            'Share the project link in the submissions thread under the Discord channel #nearvember-4-guest-book for us to test',
        ],
        'prizes': []
    },
    # task 5
    {
        'title': 'Build a simple frontend to connect with your NFT smart contract',
        'description': '''
Build a frontend for the NFT contract you deployed for the first challenge. It can be as simple or complex as you like!
Build a frontend to connect with the [NFT smart contract example](https://examples.near.org/NFT) you deployed on the first day.
The frontend should allow a user to log in with NEAR and mint an NFT to their own wallet.

If you did not complete the first challenge, you can clone and deploy [this example](https://examples.near.org/NFT).
''',
        'tasks': [
            'Deploy your code somewhere (GitHub Pages and Netlify are easy)',
            'Share the project link on the Discord channel #challenge-5-nft-frontend for us to test'
        ],
        'prizes': []
    },
    # task 6
    {
        'title': 'Create and deploy a transfer service for your own fungible token',
        'description': '''
Clone the [FT smart contract example](https://examples.near.org/FT)
Create a frontend to allow users to transfer tokens from one wallet to another
It can be as simple or complex as you like!
        ''',
        'tasks': [
            'Deploy the contract on testnet',
            'Deploy the frontend somewhere (Netlify and gitHub Pages are simple to use)',
            'Share the project link in the thread under the Discord channel #challenge-6-ft-transfer-frontend for us to test',
        ],
        'prizes': []
    },
    # task 7
    {
        'title': 'Create and deploy a voting smart contract',
        'description': '''
Assume this is a smart contract for voting on a US president.
The contract should have the following methods:

- Add candidate: adds a potential candidate that users can vote on
- View candidates: view all the candidates and the number of votes they have
- Vote: anyone with a NEAR wallet can vote on *one* candidate *once*

You do not have to worry about permissions. We won't deduct points if anyone can call every method
You can write the contract in any language
        ''',
        'tasks': [
            'Deploy the contract on testnet',
            'Share the commands on the Discord thread under the channel #challenge-7-voting-contract so we can vote and view candidates',
        ],
        'prizes': []
    },
    # task 8
    {
        'title': 'Create and deploy a voting smart contract',
        'description': '''
The frontend should allow users to:

- Vote for a candidate (only once)
- View all candidates and their votes
- That's it.
        ''',
        'tasks': [
            'Deploy your project somewhere',
            'Share the GitHub link in the thread under the Discord channel #challenge-8-voting-frontend so we can test it!'
        ],
        'prizes': []
    },
    # task 9
    {
        'title': 'Cross-contract calling challenge',
        'description': '''
A cross-contract call is when one smart contract calls another. You can find out more about NEAR cross-contract calls [here](https://docs.near.org/docs/tutorials/contracts/xcc-receipts).
What to do:
Write a smart contract (A) that calls another contract (B). Use any language you'd like.
Contract A should use data returned from Contract B
You can implement this however you like. Some examples:

- Contract A allows a user to log in, then calls Contract B to see how much NEAR they have in their wallet. Contract A returns 'Wow!' if there is more than 10 NEAR or 'Uh oh' if it is below 10 NEAR.'
- Contract A allows a user to log in, then calls Contract B which is a voting contract that returns if the user has already voted. Contract A tells the user if they have voted or not.
- Contract A allows the user to log in and pass another user's wallet. Contract A calls Contract B to see how much NEAR is in that wallet, and returns this to Contract A. Contract A sends NEAR from the user to this wallet if there is under 10 NEAR, else is returns "This wallet does not need more NEAR."

Deploy them on testnet.
        ''',
        'tasks': [
            'Deploy both smart contracts on testnet',
            'Share the command(s) in the thread on the Discord channel #challenge-9-cross-contract so we can test your contract'
        ],
        'prizes': []
    },
    # task 10
    {
        'title': 'FREE FOR ALL!!',
        'description': '''
Do whatever you want.
Share it with us on Discord.
        ''',
        'tasks': [
            'Deploy your smart contracts or front ends',
            'Share your projects in the thread under the #challenge-10-free-for all Discord!'
        ],
        'prizes': []
    }
]


def load_env():
    with open('.env') as fp:
        data = [x.split('=') for x in fp.read().split('\n') if x]
        data = {x[0]: x[1] for x in data}

    env = {}
    env.update(os.environ)
    env.update(data)
    return env


challenges = []
for i, task in enumerate(tasks, 1):
    task['name'] = 'nov%02d' % i
    task['title'] = task['title'].strip()
    task['description'] = task['description'].strip()
    task['tasks'] = [x.strip() for x in task['tasks']]

    task['description'] = ''
    del task['tasks']

    task['prizes'] = []
    prizes = results.get(i, {}).get('prizes', [])
    for prize in prizes:
        task['prizes'].append({
            'name': prize[0],
            'title': '',
            'points': prize[1],
            'max_winners': prize[2],
        })

    challenges.append(task)

winners = []
for i, x in results.items():
    for k, v in x.items():
        if k == 'prizes':
            continue

        for u in v:
            winner = {
                'challenge': 'nov%02d' % i,
                'prize': k,
                'competitor': u,
                'action': 'add'
            }
            winners.append(winner)

# near_call('add_challenges', {'challenges': challenges[5]})
near_call('add_winners', {'winners': winners[0]})

# for x in chunks(winners, 50):
# near_call('add_winners', {'winners': x})
