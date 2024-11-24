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

  const query = `query ($org: String!) {
  organization(login: $org) {
    repositories(last: 10) {
      nodes {
        name
        isFork
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

  const { organization } = await octokit.graphql<{
    organization: {
      repositories: {
        nodes: {
          name: string,
          isFork: boolean,
          parent: null | { owner: { login: string }, name: string }
        }[]
      }
    }
  }>(query, { org: "os-checker" });
  log(organization);
  log(organization.repositories.nodes);
}

main();
