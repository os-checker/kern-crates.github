import subprocess

f = open("sync_list.txt", "r")
for line in f.readlines():
    if len(line) == 0 or line.strip() == '':
        continue
    print('Mirroring ' + line.strip());
    # # remote repo full_name, format: {{owner}}/{{repo}}
    remote_repo = line.strip()
    # # get repository name from remote repo full_name
    repo_name = remote_repo.split("/")[-1]

    # the result of running sync command
    sync_result = subprocess.run([
        "gh", 
        "repo", 
        "sync", 
        "kern-crates/" + repo_name
    ], capture_output=True, text=True)
    print(sync_result.stderr)
    need_fork = sync_result.stderr.startswith("GraphQL: Could not resolve to a Repository with the name")

    if need_fork == False:
    # Check whether the repo' parent is the given remote repo
        need_fork = False
        parent_result = subprocess.run([
            "gh", 
            "repo", 
            "view", 
            "kern-crates/" + repo_name, 
            "--json", 
            "parent"
        ], capture_output=True, text=True)
    
        # Parse the parent result with json
        import json
        parent_owner= json.loads(parent_result.stdout)["parent"]["owner"]["login"]
        parent_repo = json.loads(parent_result.stdout)["parent"]["name"]

        if parent_owner + "/" + parent_repo != remote_repo:
            # Delete the repository and fork it again
            subprocess.run([
                "gh", 
                "repo", 
                "delete", 
                "kern-crates/" + repo_name, 
                "--yes"
            ], capture_output=True, text=True)
            need_fork = True

    if need_fork:
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