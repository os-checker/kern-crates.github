import subprocess

f = open("sync_list.txt", "r")
for line in f.readlines():
    if len(line) == 0 or line.strip() == '':
        continue
    print('Mirroring ' + line.strip());
    # remote repo full_name, format: {{owner}}/{{repo}}
    remote_repo = line.strip()
    # get repository name from remote repo full_name
    repo_name = remote_repo.split("/")[-1]

    # the result of running sync command
    sync_result = subprocess.run([
        "gh", 
        "repo", 
        "sync", 
        "kern-crates/" + repo_name
    ], capture_output=True, text=True)

    print(sync_result.stderr)
    # # If the repo not exists, fork it form remote.
    if sync_result.stderr.startswith("GraphQL: Could not resolve to a Repository with the name"):
        # fork the repository
        subprocess.run([
            "gh", 
            "repo", 
            "fork", 
            remote_repo, 
            "--org", 
            "kern-crates", 
            "--default-branch-only"
        ], capture_output=True, text=True)
        