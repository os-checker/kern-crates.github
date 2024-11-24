import { Octokit, App } from "octokit";
import { gh_token } from "./query.ts";

async function main() {
  const octokit = new Octokit({ auth: gh_token() });

  const {
    viewer: { login },
  } = await octokit.graphql(`{
  viewer {
    login
  }
}`);

  console.log(login);
}

main();
