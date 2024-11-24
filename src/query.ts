/**
 * `GH_TOKEN` or `GITHUB_TOKEN`.
*/
export function gh_token() {
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("请提供 GH_TOKEN 或者 GITHUB_TOKEN，比如 `GH_TOKEN: ${{ github.token }}`");
  }
  return token;
}
