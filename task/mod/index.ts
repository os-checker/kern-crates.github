import { Octokit } from "octokit";
import { log } from "node:console";
import * as query from "./query.ts";
import { read_exclude_list, read_sync_list } from "./sync_list.ts";
import { gen_owned_repos, sync_or_fork } from "./types.ts";
import { writeFile } from "node:fs/promises";

async function main() {

  const exclude_list = await read_exclude_list();
  log("exclude_list", exclude_list);

  const sync_list = await read_sync_list();
  log("sync_list", sync_list);

  const octokit = new Octokit({ auth: query.gh_token() });

  const {
    viewer: { login },
  } = await octokit.graphql<{
    viewer: { login: string }
  }>(`{ viewer { login } }`);

  log("login:", login);

  const owner = "kern-crates";
  const { repositoryOwner } = await octokit.graphql.paginate<query.Repos>(
    query.repos, { login: owner }
  );
  // log(repositoryOwner);
  // log(repositoryOwner.repositories.nodes);

  const owned_repos = gen_owned_repos(owner, repositoryOwner);

  const repo_list = sync_or_fork(sync_list, exclude_list, owned_repos, owner);
  log("\nrepo_list.length =", repo_list.length);
  await writeFile("repo_list.json", JSON.stringify(repo_list, null, 2));
  await writeFile("repo_list_raw.json", JSON.stringify({ sync_list, exclude_list, owner, owned_repos }, null, 2));

}

main().then(() => log("Main thread done.")).catch(err => console.error(err));
