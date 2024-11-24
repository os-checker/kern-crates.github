import { Octokit } from "octokit";
import { gh_token } from "./query.ts";
import { log } from "node:console";

async function main() {
  const octokit = new Octokit({ auth: gh_token() });

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

  const query = `query ($login: String!) {
  repositoryOwner(login: $login) {
    repositories(last: 5) {
      totalCount
      nodes {
        name
        parent {
          owner {
            login
          }
          name
        }
      }
    }
  }
}`;

  type QueryRepos = {
    repositoryOwner: {
      repositories: {
        totalCount: number,
        nodes: {
          name: string,
          parent: null | { owner: { login: string }, name: string }
        }[]
      }
    }
  };

  const { repositoryOwner } = await octokit.graphql<QueryRepos>(query, { login: "zjp-CN" });
  log(repositoryOwner);
  log(repositoryOwner.repositories.nodes);
}

main();
