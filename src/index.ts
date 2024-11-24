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

  const query = `query ($login: String!, $num: Int = 100, $cursor: String) {
  repositoryOwner(login: $login) {
    repositories(first: $num, after: $cursor) {
      totalCount
      nodes {
        name
        parent {
          owner { login }
          name
        }
      }
      pageInfo { hasNextPage endCursor }
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

  const { repositoryOwner } = await octokit.graphql.paginate<QueryRepos>(query, { login: "zjp-CN" });
  log(repositoryOwner);
  log(repositoryOwner.repositories.nodes);
}

main();
