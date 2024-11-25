import { Octokit } from "octokit";
import { log } from "node:console";
import * as query from "./query.ts";
import { read_sync_list } from "./sync_list.ts";
import { gen_owned_repos, sync_or_fork } from "./types.ts";

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

main().then(() => log("Main thread done.")).catch(err => console.error(err));
