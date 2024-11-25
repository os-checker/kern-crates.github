
export type UserRepo = {
  user: string,
  repo: string,
}

export type OwnedRepo = {
  owned: UserRepo,
  non_owned: null | UserRepo,
}

