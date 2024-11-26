import * as query from "./query.ts";

export type UserRepo = {
  user: string,
  repo: string,
}

export type OwnedRepo = {
  owned: UserRepo,
  non_owned: null | UserRepo,
}

export function to_string(user_repo: UserRepo) {
  return `${user_repo.user}/${user_repo.repo}`;
}

export function gen_owned_repos(owner: string, repos: query.RepositoryOwner): OwnedRepo[] {
  return repos.repositories.nodes.map(repo => {
    const owned = { user: owner, repo: repo.name };
    const non_owned = repo.parent && { user: repo.parent.owner.login, repo: repo.parent.name };
    return { owned, non_owned }
  });
}

