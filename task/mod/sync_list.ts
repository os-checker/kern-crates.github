import { readFile } from "node:fs/promises";
import { type UserRepo } from "./types.ts";

/** 
 * Returns path to `sync_list.txt`, or `sync_list_test.txt` if `TEST` is set.
 * */
function sync_list_txt() {
  return (process.env.TEST === "true") ? "test/sync_list_test.txt" : "../sync_list.txt";
}

async function read_list(path: string): Promise<UserRepo[]> {
  const sync_list = await readFile(path);
  return sync_list.toString("utf-8").trim().split("\n").map(line => {
    const [user, repo] = line.split("/").map(word => word.trim());
    if (!user) { throw new Error(`No user in \`${line}\`.`); }
    if (!repo) { throw new Error(`No repo in \`${line}\`.`); }
    return { user, repo };
  });
}

export async function read_sync_list(): Promise<UserRepo[]> {
  return await read_list(sync_list_txt());
}

export async function read_exclude_list(): Promise<UserRepo[]> {
  return await read_list("../exclude_list.txt");
}
