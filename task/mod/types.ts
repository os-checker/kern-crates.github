import chalk from 'chalk';
import { log } from "node:console";
import * as query from "./query.ts";
import { execSync } from "node:child_process";

export type UserRepo = {
  user: string,
  repo: string,
}

function to_string(user_repo: UserRepo) {
  return `${user_repo.user}/${user_repo.repo}`;
}

export type OwnedRepo = {
  owned: UserRepo,
  non_owned: null | UserRepo,
}

export function gen_owned_repos(owner: string, repos: query.RepositoryOwner): OwnedRepo[] {
  return repos.repositories.nodes.map(repo => {
    const owned = { user: owner, repo: repo.name };
    const non_owned = repo.parent && { user: repo.parent.owner.login, repo: repo.parent.name };
    return { owned, non_owned }
  });
}

/**
 * any non_owned matches against repo_in_sync_list => need syncing
 * all non_owned don't match against repo_in_sync_list: UserRepo => need forking
 */
export function sync_or_fork(sync_list: UserRepo[], exclude_list: UserRepo[], owned_repos: OwnedRepo[], owner: string) {
  const non_onwed = owned_repos.map(val => val.non_owned);
  let repos: string[] = [];

  for (const outer of sync_list) {
    const repo_name = to_string(outer);
    const pos = non_onwed.findIndex(val => val?.user === outer.user && val.repo === outer.repo);

    if (pos === -1) {
      // need forking
      if (do_fork(owner, outer)) {
        repos.push(repo_name);
      } else {
        console.error(chalk.bgRed(`${repo_name} is not forked.`));
      }
    } else {
      // need syncing
      if (do_sync(owned_repos[pos].owned)) {
        repos.push(repo_name);
      } else {
        console.error(chalk.bgRed(`${repo_name} is not synced.`));
      }
    }
  }

  // generate source repo list
  for (const repo of owned_repos) {
    if (repo.non_owned) {
      repos.push(to_string(repo.non_owned));
    } else {
      repos.push(to_string(repo.owned));
    }
  }

  let set = new Set(repos);

  // remove repos from exclude_list
  for (const exclude of exclude_list) {
    set.delete(to_string(exclude));
  }

  return [...set].sort();
}

function do_sync(owned: UserRepo) {
  // Sync remote fork from its parent
  // src: https://cli.github.com/manual/gh_repo_sync
  const cmd = `gh repo sync ${owned.user}/${owned.repo}`;
  return do_(cmd);
}

function do_fork(owner: string, outer: UserRepo) {
  // gh repo fork non_owned --org kern-crates --default-branch-only
  // src: https://cli.github.com/manual/gh_repo_fork
  const cmd = `gh repo fork ${outer.user}/${outer.repo} --org ${owner} --default-branch-only`;
  return do_(cmd);
}

// gh CLI writes data to TTY but not to pipe, so even if we get output from terminal,
// nothing is captured in the callback.
//
// But we can use inherit stdio to capture the gh output.
function do_(cmd: string) {
  let success = true;
  console.time(cmd);

  if (process.env.EXECUTE === "true") {
    log(chalk.yellow(`\n[real exec] ${cmd}`));

    try {
      execSync(cmd, { stdio: 'inherit' });
    } catch (error) {
      success = false;
      let err: any = error;
      handleExecOutput(cmd, err, err.stdout, err.stderr);
    }

    console.timeEnd(cmd);
    return success;
  }
}

function handleExecOutput(cmd: string, error: any, stdout: string, stderr: string) {
  if (stdout) { log(`${cmd} [stdout]: ${stdout}`); }
  if (error) {
    console.error(chalk.bgRed(`${cmd} 执行出错:\n`) + chalk.red(`${stderr}`));
  } else if (stderr) {
    console.error(`${cmd} [stderr]: ${stderr}`);
  }
}

