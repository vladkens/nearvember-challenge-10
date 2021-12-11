use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupSet, UnorderedMap};
use near_sdk::{near_bindgen, BorshStorageKey, env, AccountId};
use near_sdk::serde::{Deserialize, Serialize};
use std::collections::{HashSet, HashMap};

// https://www.near-sdk.io/contract-structure/collections
// https://docs.rs/near-sdk/2.0.1/near_sdk/env/index.html


type CompetitorId = u32;

#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Competitor {
  pub id: CompetitorId,
}

#[derive(Debug)]
#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Prize {
  pub title: String,
  pub points: u32,
  pub max_winners: u32, // 0 means all can achive this
  pub winners: HashSet<CompetitorId>,
}

#[derive(Debug)]
#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Challenge {
  pub title: String,
  pub description: String,
  pub prizes: HashMap<String, Prize>,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Contract {
  pub admins: LookupSet<AccountId>,

  pub competitor_counter: CompetitorId,
  pub competitors: UnorderedMap<String, Competitor>,
  pub challanges: UnorderedMap<String, Challenge>,
}

#[derive(BorshStorageKey, BorshSerialize)]
pub enum StorageKeys {
  Admins,
  Competitors,
  Challenges,
}

impl Default for Contract {
  fn default() -> Self {
    Self {
      admins: LookupSet::new(StorageKeys::Admins),

      competitor_counter: 0,
      competitors: UnorderedMap::new(StorageKeys::Competitors),
      challanges: UnorderedMap::new(StorageKeys::Challenges),
    }
  }
}

#[derive(Deserialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct PrizeTO {
  pub name: String,
  pub title: String,
  pub points: u32,
  pub max_winners: u32, // 0 means all can achive this
}

#[derive(Deserialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct ChallengeTO {
  pub name: String,
  pub title: String,
  pub description: String,
  pub prizes: Vec<PrizeTO>
}

#[derive(Deserialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct WinnerTO {
  pub challenge: String,
  pub competitor: String,
  pub prize: String,
  pub action: String,
}

#[near_bindgen]
impl Contract {
  pub fn add_winners(&mut self, winners: Vec<WinnerTO>) {
    self.check_admin();

    for to in winners.iter() {
      let action = to.action.clone();
      if action != "add" && action != "del" {
        env::panic(format!("No action name={}", action).as_bytes());
      }

      let challenge = self.challanges.get(&to.challenge);
      if challenge.is_none() {
        env::panic(format!("No challenge name={}", &to.challenge).as_bytes());
      }

      let mut challenge = challenge.unwrap();
      let prize = challenge.prizes.get(&to.prize);
      if prize.is_none() {
        env::panic(format!("Prize name={} not in challenge name={}", &to.prize, &to.challenge).as_bytes());
      }

      let mut competitor = self.competitors.get(&to.competitor);
      if competitor.is_none() {
        self.competitor_counter += 1;
        let new_c = Competitor { id: self.competitor_counter };
        self.competitors.insert(&to.competitor, &new_c);
        competitor = Some(new_c);
      }

      let prize = prize.unwrap();
      let competitor = competitor.unwrap();

      let mut winners = HashSet::new();
      for x in prize.winners.iter() {
        winners.insert(*x);
      }

      if action == "add" { winners.insert(competitor.id); }
      if action == "del" { winners.remove(&competitor.id); }

      let p = Prize {
        title: prize.title.clone(),
        points: prize.points,
        max_winners: prize.max_winners,
        winners: winners,
      };

      let mut prizes = challenge.prizes;
      prizes.insert(to.prize.to_string(), p);
      challenge.prizes = prizes;
      self.challanges.insert(&to.challenge, &challenge);
      // println!("{:?}", challenge);
    }
  }

  pub fn scores(&self) -> Vec<(String, u32)> {
    let mut scores: HashMap<String, u32> = HashMap::new();
    let mut inline: HashMap<String, u32> = HashMap::new();
    let mut unames: HashMap<u32, String> = HashMap::new();

    for (name, x) in self.competitors.iter() {
      scores.insert(name.clone(), 0);
      inline.insert(name.clone(), 0);
      unames.insert(x.id, name.clone());
    }

    for (_, chal) in self.challanges.iter() {
      let mut who_complete: HashSet<String> = HashSet::new();

      for (p_name, prize) in chal.prizes.iter() {
        for user_id in prize.winners.iter() {
          let u_name = String::from(unames.get(&user_id).unwrap());

          let mut val = *scores.get(&u_name).unwrap();
          val = val + prize.points;
          if p_name.to_string() == "baseline".to_string() {
            who_complete.insert(u_name.clone());
            
            let mul = *inline.get(&u_name.clone()).unwrap() * 40;
            val = val + mul;
          }

          scores.insert(u_name, val);
        }
      }

      for u_name in scores.keys() {
        if !who_complete.contains(u_name) {
          inline.insert(u_name.clone(), 0);
        }
      }
    }

    let mut sorted: Vec<(String, u32)> = scores.into_iter().collect();
    sorted.sort_by(|a, b| b.1.cmp(&a.1));
    sorted
    // scores
  }

  fn check_owner(&mut self) {
    if env::current_account_id().to_string() != env::predecessor_account_id() {
      env::panic("Only owner can call this method!".as_bytes())
    }
  }

  fn check_admin(&mut self) {
    let caller = env::predecessor_account_id();
    if env::current_account_id().to_string() != caller && !self.admins.contains(&caller) {
      env::panic("Only admin can call this method!".as_bytes())
    }
  }

  pub fn add_admin(&mut self, account: AccountId) {
    // self.check_owner();
    self.admins.insert(&account);
  }

  pub fn del_admin(&mut self, account: AccountId) {
    // self.check_owner();
    self.admins.remove(&account);
  }

  pub fn add_challenges(&mut self, challenges: Vec<ChallengeTO>) {
    self.check_admin();

    for to in challenges.iter() {
      let mut prizes: HashMap<String, Prize> = HashMap::new();
      for p in &to.prizes {
        let prize = Prize {
          title: p.title.clone(),
          points: p.points,
          max_winners: p.max_winners,
          winners: HashSet::new(),
        };
        prizes.insert(p.name.clone(), prize);
      }

      let chal = Challenge {
        title: to.title.clone(),
        description: to.description.clone(),
        prizes: prizes,
      };

      self.challanges.insert(&to.name, &chal);
    }
  }

  pub fn get_challenges(&self) -> Vec<(String, Challenge)> {
    self.challanges.to_vec()
  }

  pub fn clear_state(&mut self) {
    self.check_owner();

    let keys = self.challanges.keys().collect::<Vec<String>>();
    for k in keys {
      self.challanges.remove(&k);
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use near_sdk::{MockedBlockchain, testing_env, VMContext};
  use near_sdk::test_utils::{VMContextBuilder};

  const ALICE: &str = "alice.near";
  const BOB: &str = "bob.near";

  fn get_ctx(caller: Option<&str>, owner: Option<&str>) -> VMContext {
    let caller = caller.unwrap_or(BOB);
    let owner = owner.unwrap_or(ALICE);

    VMContextBuilder::new()
      .current_account_id(owner.try_into().unwrap())
      .predecessor_account_id(caller.try_into().unwrap())
      .build()
  }

  fn make_challenge(title: &str) -> ChallengeTO {
    let prize = PrizeTO {
      name: [title.to_string(), "prize".to_string()].join("_"),
      title: [title.to_string(), "prize".to_string()].join(" "),
      max_winners: 0,
      points: 10,
    };

    let challenge = ChallengeTO {
      name: title.to_string(),
      title: title.to_string(),
      description: "".to_string(),
      prizes: Vec::from([prize]),
    };

    challenge
  }

  fn make_win(challenge: &str, p_id:  &str, competitor: &str, action: &str) -> WinnerTO {
    WinnerTO {
      challenge: challenge.to_string(),
      prize: p_id.to_string(),
      competitor: competitor.to_string(),
      action: action.to_string(),
    }
  }

  #[test]
  #[should_panic(expected = "Only owner can call this method!")]
  fn test_add_admin() {
    testing_env!(get_ctx(Some(ALICE), Some(ALICE)));
    let mut c = Contract::default();

    c.add_admin("alice.near".to_string());

    testing_env!(get_ctx(Some(BOB), Some(ALICE)));
    c.add_admin("alice.near".to_string());
  }

  #[test]
  fn test_add_challenge() {
    testing_env!(get_ctx(Some(ALICE), Some(ALICE)));
    let mut c = Contract::default();

    c.add_challenges(Vec::from([make_challenge("1"), make_challenge("2")]));

    let win1 = make_win("1", "1_prize", BOB, "add");
    let win2 = make_win("2", "2_prize", BOB, "add");
    let win3 = make_win("1", "1_prize", ALICE, "add");
    // let win2 = make_win("2", "2_prize", BOB, "add");

    c.add_winners(Vec::from([win3, win1, win2]));

    let scores = c.scores();
    println!("{:?}", scores);
    // let s = c.get_challenges();
    // println!("{:?}", s);
  }

  #[test]
  fn test_bits_ops() {
    let a: u32 = 516;
    let b: u32 = 134;
    let c: u64 = (a as u64).rotate_left(32) + b as u64;
    let d: u32 = (c >> 32).try_into().unwrap();
    let e: u32 = c as u32;

    assert_eq!(a, d);
    assert_eq!(b, e);

    let a: u32 = u32::MAX;
    let b: u32 = u32::MAX;
    let c: u64 = (a as u64).rotate_left(32) + b as u64;
    let d: u32 = (c >> 32).try_into().unwrap();
    let e: u32 = c as u32;

    assert_eq!(a, d);
    assert_eq!(b, e);
  }
}