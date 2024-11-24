import { Octokit } from "octokit";
import { log } from "node:console";
import * as query from "./query.ts";
import { readFile } from "node:fs/promises";

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

  const { repositoryOwner } = await octokit.graphql.paginate<query.Repos>(
    query.repos, { login: "kern-crates" }
  );
  log(repositoryOwner);
  log(repositoryOwner.repositories.nodes);
}

type UserRepo = {
  user: string,
  repo: string,
}

async function read_sync_list(): Promise<UserRepo[]> {
  const sync_list = await readFile("../sync_list.txt");
  return sync_list.toString("utf-8").trim().split("\n").map(line => {
    const [user, repo] = line.split("/").map(word => word.trim());
    if (!user) { throw new Error(`No user in \`${line}\`.`); }
    if (!repo) { throw new Error(`No repo in \`${line}\`.`); }
    return { user, repo };
  });
}

// FIXME: implement exclude list

main();
