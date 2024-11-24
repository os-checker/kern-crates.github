import { Octokit } from "octokit";
import { log } from "node:console";
import * as query from "./query.ts";

async function main() {
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
    query.repos, { login: "zjp-CN" }
  );
  log(repositoryOwner);
  log(repositoryOwner.repositories.nodes);
}

main();
