import { Octokit } from "octokit";
import chalk from 'chalk';
import { log } from "node:console";
import * as query from "./query.ts";
import { read_sync_list } from "./sync_list.ts";
import type { UserRepo, OwnedRepo } from "./types.ts";
import { exec, ExecException } from "node:child_process";

async function main() {

  const sync_list = await read_sync_list();
  log(sync_list);

  const octokit = new Octokit({ auth: query.gh_token() });

  const {
    viewer: { login },
  } = await octokit.graphql<{
    viewer: { login: string }
  }>(`{
  viewer {
    login
  }
}`);

  log(login);

  const owner = "kern-crates";
  const { repositoryOwner } = await octokit.graphql.paginate<query.Repos>(
    query.repos, { login: owner }
  );
  // log(repositoryOwner);
  // log(repositoryOwner.repositories.nodes);

  const owned_repos = gen_owned_repos(owner, repositoryOwner);

  sync_or_fork(sync_list, owned_repos, owner);

}

function gen_owned_repos(owner: string, repos: query.RepositoryOwner): OwnedRepo[] {
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
function sync_or_fork(sync_list: UserRepo[], owned_repos: OwnedRepo[], owner: string) {
  const non_onwed = owned_repos.map(val => val.non_owned);

  for (const outer of sync_list) {
    const pos = non_onwed.findIndex(val => val?.user === outer.user && val.repo === outer.repo);
    if (pos === -1) {
      // need forking
      do_fork(owner, outer);
    } else {
      // need syncing
      do_sync(owned_repos[pos].owned);
    }
  }
}

function do_sync(owned: UserRepo) {
  // Sync remote fork from its parent
  // src: https://cli.github.com/manual/gh_repo_sync
  const cmd = `gh repo sync ${owned.user}/${owned.repo}`;
  do_(cmd);
}

function do_fork(owner: string, outer: UserRepo) {
  // gh repo fork non_owned --org kern-crates --default-branch-only
  // src: https://cli.github.com/manual/gh_repo_fork
  const cmd = `gh repo fork ${outer.user}/${outer.repo} --org ${owner} --default-branch-only`;
  do_(cmd);
}

function do_(cmd: string) {
  console.time(cmd);
  if (process.env.EXECUTE === "true") {
    log(chalk.yellow(`[real exec] ${cmd}`));
    exec(cmd, (error, stdout, stderr) => handleExecOutput(cmd, error, stdout, stderr));
  } else {
    log(chalk.gray(`[fake exec] ${cmd}`));
  }
  console.timeEnd(cmd);
}

function handleExecOutput(cmd: string, error: ExecException | null, stdout: string, stderr: string) {
  // gh CLI writes data to TTY but not to pipe, so even if we get output from terminal,
  // nothing is captured in the callba the callback.
  // See https://stackoverflow.com/questions/72731726/how-do-i-capture-output-of-the-following-command-gh-workflow-run-id
  // and https://stackoverflow.com/questions/78316928/gh-has-different-output-when-captured-with-python-subprocess-run
  if (stdout) { log(`${cmd} [stdout]: ${stdout}`); }
  if (error) {
    console.error(chalk.bgRed(`${cmd} 执行出错:\n`) + chalk.red(`${stderr}`));
  } else if (stderr) {
    console.error(`${cmd} [stderr]: ${stderr}`);
  }
}

main().then(() => log("Main thread done.")).catch(err => console.error(err));
