import { cmd, expected, note, p, ul, warn, type Drill } from "./types";

export const gitDrills: Drill[] = [
  {
    module: "git",
    slug: "two-commits",
    number: 1,
    title: "Make two commits you can explain",
    minutes: 25,
    outcome:
      "You can create a repository, see what changed, and record a commit whose message says what the menu gained.",
    handIn: "The output of git status and git log --oneline. Two commits, and a clean working tree.",
    steps: [
      {
        id: "git-two-commits-1",
        title: "Create a repository and set your name in this repo only",
        blocks: [
          warn(
            "Use bash: macOS Terminal, Linux, or Git Bash on Windows. If a command contains << and your shell says it does not understand it, you are not in bash.",
          ),
          p("Work in a new folder. Do this outside this project, in your home directory."),
          cmd(`mkdir -p "$HOME/drillbook-git"
cd "$HOME/drillbook-git"
git init
git config user.name "Your Name"
git config user.email "you@university.example"
git config --show-origin --local user.name
git config --show-origin --local user.email`),
          p("Replace the name and email with yours before you run the config lines. The email does not have to be able to receive mail for this lab. Use the one you want on your commits anyway, so the habit is right."),
          expected(`file:.git/config    Your Name
file:.git/config    you@university.example`),
          note("The origin says file: and the path ends in .git/config. That is this repository's config, not a global file in your home directory. A later project can use a different name without you hunting through machine settings."),
        ],
      },
      {
        id: "git-two-commits-2",
        title: "Write a menu and look at it before you commit",
        blocks: [
          cmd(`cat > menu.txt << 'EOF'
espresso | 2.50
cardamom latte | 4.00
EOF
git status`),
          expected(`Untracked files:
        menu.txt

nothing added to commit but untracked files present`),
          p("Untracked means Git can see the file and is not recording it yet. Nothing is staged. The index, which Git also calls the staging area, is still empty."),
        ],
      },
      {
        id: "git-two-commits-3",
        title: "Stage the file and make the first commit",
        blocks: [
          cmd(`git add menu.txt
git status
git commit -m "Add the opening menu"
git branch -M main
git status
git log --oneline`),
          expected(`nothing to commit, working tree clean

a1b2c3d Add the opening menu`),
          p("Your commit id will be different. The subject and the clean status should match. Newest commits are printed first. git branch -M main names the branch main even if your Git still starts on master."),
          note("If git commit opened an editor instead of finishing, you are in vim. Press Esc, type :q!, press Enter, and run the commit again with -m."),
        ],
      },
      {
        id: "git-two-commits-4",
        title: "Change one line and read the diff before the second commit",
        blocks: [
          p("Open menu.txt in any editor and add a third line: knafeh | 5.50. Save the file. Then ask Git what changed before you record it."),
          cmd(`git diff
git add menu.txt
git diff
git diff --staged
git commit -m "Add knafeh to the menu"
git log --oneline
git status`),
          expected(`The first git diff shows one added line, knafeh | 5.50.
After git add, git diff prints nothing.
git diff --staged shows that same added line.
git log --oneline lists two commits, knafeh first.
git status says the working tree is clean.`),
          p("git diff compares the working tree with the index. After you stage, those two match, so the first form goes quiet. git diff --staged compares the index with the last commit, which is the change you are about to record."),
        ],
      },
    ],
    questions: [
      {
        q: "Name the three places a change can be: the working tree, the index, and a commit. Which command moves a change from the first to the second?",
        a: "git add copies the current file into the index. git commit then records the index as a new commit. The working tree is the files you edit.",
      },
      {
        q: "Why did git diff go quiet after git add, even though the commit had not happened yet?",
        a: "git diff with no flags compares the working tree to the index. Staging made them identical. The change was still uncommitted, which is why git diff --staged could still show it.",
      },
      {
        q: "Where did git config store your name in this drill, and what did you avoid changing?",
        a: "It stored the name in .git/config for this repository only. You did not pass --global, so you did not change the settings for every repository on the machine.",
      },
    ],
    mistakes: [
      "A commit message that says \"update\" or \"fix\". Say what the menu gained.",
      "Running the commands in the wrong folder. pwd tells you where you are. git rev-parse --show-toplevel tells you which repository you are in.",
      "git commit with no -m opens an editor. Use the message from the drill, or finish the editor and save.",
      "Editing menu.txt and committing without reading git diff. The diff is how you check that you staged only what you meant.",
    ],
    checkpoint:
      "git status is clean, and git log --oneline shows exactly two commits: \"Add knafeh to the menu\" and then \"Add the opening menu\".",
  },
  {
    module: "git",
    slug: "branches",
    number: 2,
    title: "A branch is a label",
    minutes: 30,
    outcome:
      "You can do work on a branch, keep committing on main, and merge both sides without losing either change.",
    handIn: "git log --oneline --graph --all, plus the contents of menu.txt.",
    steps: [
      {
        id: "git-branches-1",
        title: "Start from the menu you already committed",
        blocks: [
          cmd(`cd "$HOME/drillbook-git"
git switch main
git status
cat menu.txt`),
          expected(`On branch main
nothing to commit, working tree clean

espresso | 2.50
cardamom latte | 4.00
knafeh | 5.50`),
          warn("If the menu does not match, and you are happy to set this repository back to the start of this drill, rewrite menu.txt to those three lines, then git add menu.txt and git commit -m \"Align the menu with the branch drill\". Do not do that in a repository you care about."),
        ],
      },
      {
        id: "git-branches-2",
        title: "Commit a price change on a new branch",
        blocks: [
          p("A branch is a name that points at a commit. Creating one does not copy the folder. git switch -c creates the name and checks it out, so the next commit moves that name and not main."),
          cmd(`git switch -c feature/prices
git branch --show-current`),
          p("Open menu.txt and change only the cardamom latte price from 4.00 to 4.50. Save, then look at the diff. You want one changed line and nothing else."),
          cmd(`git diff
git add menu.txt
git commit -m "Raise the cardamom latte to 4.50"
git log --oneline --decorate`),
          expected(`feature/prices is ahead of main by the price commit.
main still points at "Add knafeh to the menu".`),
          note("Older notes use git checkout -b feature/prices. It does the same thing. Use switch in this lab."),
        ],
      },
      {
        id: "git-branches-3",
        title: "Commit a different change on main",
        blocks: [
          cmd(`git switch main
cat menu.txt`),
          p("The price you just committed is not on this branch. main never moved. Add mint tea as a new last line: mint tea | 2.00. Do not change the latte price on this branch. It is still 4.00 here, and that is what makes the histories diverge."),
          cmd(`git diff
git add menu.txt
git commit -m "Add mint tea"
git log --oneline --all --graph --decorate`),
          expected(`The graph shows main and feature/prices splitting after "Add knafeh to the menu". One side has the mint tea commit. The other has the price commit.`),
        ],
      },
      {
        id: "git-branches-4",
        title: "Merge the price branch and read the result",
        blocks: [
          p("You are on main. Merging feature/prices brings that commit in. This cannot be a fast-forward: each branch has a commit the other does not, so Git creates a merge commit with two parents."),
          cmd(`git merge feature/prices -m "Merge price update"
cat menu.txt
git log --oneline --graph --all`),
          expected(`espresso | 2.50
cardamom latte | 4.50
knafeh | 5.50
mint tea | 2.00

The graph joins. The merge commit sits above both "Add mint tea" and "Raise the cardamom latte to 4.50".`),
          p("The latte is 4.50 and mint tea is present. Git could combine them because the two branches edited different lines. If Git stopped with a conflict, the two branches touched the same line. Look at drill 3 for how to read the markers, or run git merge --abort and redo the edits so only the price changes on the feature branch and only mint tea is added on main."),
        ],
      },
    ],
    questions: [
      {
        q: "What is a branch, if it is not a second copy of the folder?",
        a: "A branch is a movable label pointing at a commit. The commits are the history. Switching branches moves your files to match the commit that label points at.",
      },
      {
        q: "Why was this merge not a fast-forward?",
        a: "main had the mint tea commit, and feature/prices had the price commit. Neither label was a simple ancestor of the other, so Git wrote a merge commit with two parents.",
      },
      {
        q: "After the merge, does feature/prices still exist?",
        a: "Yes. Merging does not delete the branch label. The commits are also reachable from main now. Deleting the label later would not delete those commits.",
      },
    ],
    mistakes: [
      "Editing before git branch --show-current. The price change belongs on feature/prices, and mint tea belongs on main.",
      "Changing the same line on both branches. This drill is about a clean merge. The conflict is the next drill, on purpose.",
      "Starting a merge with uncommitted edits. Commit or stash first. git status should be clean before git merge.",
    ],
    checkpoint:
      "menu.txt has the 4.50 latte and mint tea, and git log --oneline --graph --all shows a merge commit joining the two branches.",
  },
  {
    module: "git",
    slug: "conflict",
    number: 3,
    title: "Read a merge conflict out loud",
    minutes: 35,
    outcome:
      "You can recognize conflict markers, keep both intentions, and finish the merge with no markers left in the file.",
    handIn: "git status, and a grep that prints nothing for conflict markers.",
    steps: [
      {
        id: "git-conflict-1",
        title: "Confirm the menu, then make two branches that edit the same line",
        blocks: [
          cmd(`cd "$HOME/drillbook-git"
git switch main
git status
cat menu.txt`),
          expected(`On branch main
nothing to commit, working tree clean

espresso | 2.50
cardamom latte | 4.50
knafeh | 5.50
mint tea | 2.00`),
          p("One branch renames espresso. The other changes its price. Both rewrite the first line, which is the collision."),
          cmd(`git switch -c feature/rename-espresso
printf '%s\\n' 'short espresso | 2.50' 'cardamom latte | 4.50' 'knafeh | 5.50' 'mint tea | 2.00' > menu.txt
git add menu.txt
git commit -m "Rename espresso to short espresso"

git switch main
git switch -c feature/price-espresso
printf '%s\\n' 'espresso | 3.00' 'cardamom latte | 4.50' 'knafeh | 5.50' 'mint tea | 2.00' > menu.txt
git add menu.txt
git commit -m "Raise espresso to 3.00"`),
        ],
      },
      {
        id: "git-conflict-2",
        title: "Merge, and expect Git to stop",
        blocks: [
          cmd(`git switch feature/rename-espresso
git merge feature/price-espresso
git status`),
          expected(`Automatic merge failed; fix conflicts and then commit the result.

Unmerged paths:
        both modified:   menu.txt`),
          p("A failed merge is the result of this step, not a mistake. Git has paused in the middle of the merge. The branch you are on is still feature/rename-espresso, which is what HEAD means while you resolve it."),
        ],
      },
      {
        id: "git-conflict-3",
        title: "Read the markers out loud, then keep both intentions",
        blocks: [
          p("Open menu.txt. The first line area should look like this. The other lines may already be merged, or they may sit inside the markers if your Git marked a wider region. Either way, read the markers."),
          expected(`<<<<<<< HEAD
short espresso | 2.50
=======
espresso | 3.00
>>>>>>> feature/price-espresso`),
          ul([
            "Everything between <<<<<<< and ======= is the branch you are on (HEAD, feature/rename-espresso).",
            "Everything between ======= and >>>>>>> is the branch you merged in (feature/price-espresso).",
            "The names in the markers are there so you can say which side you are looking at.",
          ]),
          p("Both branches had a point. Keep the new name and the new price. The file, with no markers left, should be exactly:"),
          cmd(`printf '%s\\n' 'short espresso | 3.00' 'cardamom latte | 4.50' 'knafeh | 5.50' 'mint tea | 2.00' > menu.txt
grep -n '<<<<<<' menu.txt || echo "no conflict markers"`),
          expected(`no conflict markers`),
          warn("Git will let you commit a file that still contains <<<<<<<. That is a broken menu with the conflict pasted into history. Grep before you commit."),
        ],
      },
      {
        id: "git-conflict-4",
        title: "Finish the merge, then move main forward",
        blocks: [
          cmd(`git add menu.txt
git status
git commit -m "Keep the new espresso name and the new price"
git switch main
git merge feature/rename-espresso
cat menu.txt
git status`),
          expected(`The status before the commit no longer says "Unmerged paths".
The merge onto main says "Fast-forward".
The first line of menu.txt is "short espresso | 3.00".
git status is clean.`),
          note("Drill 2 needed a merge commit because the two sides had diverged in both directions. Here, main had not moved, so it could fast-forward: the main label slid forward to the commit you had already made. No extra merge commit."),
        ],
      },
    ],
    questions: [
      {
        q: "During the conflict, which branch is HEAD?",
        a: "feature/rename-espresso, because that is the branch you had checked out when you ran git merge. HEAD means the commit you are on, not \"the branch that is more correct\".",
      },
      {
        q: "What does a leftover <<<<<<< in a file mean a week later?",
        a: "Someone finished the merge without resolving it. Git does not understand the menu. It only checks that you staged the file. The markers are ordinary text once they are committed.",
      },
      {
        q: "When is git merge --abort the right command?",
        a: "When you are lost in the middle of a merge and want the branch back to how it was before the merge started. It is safer than guessing. After it, you can try the merge again.",
      },
    ],
    mistakes: [
      "Using git checkout --theirs or --ours without reading the file. Those commands throw one side away. This drill is about reading the markers.",
      "Committing while the status still says \"Unmerged paths\". git add the resolved file first.",
      "Deleting one side of the conflict and also deleting knafeh or mint tea. Keep one copy of every shared line.",
    ],
    checkpoint:
      "grep -n '<<<<<<' menu.txt prints nothing, git status is clean, and you are on main with short espresso priced at 3.00.",
  },
  {
    module: "git",
    slug: "ignore-and-remote",
    number: 4,
    title: "Ignore a secret, then push to a folder",
    minutes: 40,
    outcome:
      "You can keep a file on disk without tracking it, and you can push to and clone from a second copy of the repository on this machine.",
    handIn: "diff of the two git logs showing they match, and ls showing the clone has no .env file.",
    steps: [
      {
        id: "git-ignore-1",
        title: "Ignore a fake token before it is ever committed",
        blocks: [
          cmd(`cd "$HOME/drillbook-git"
git switch main
git status`),
          p("Pretend a teammate dropped a local config in the folder. The token below is fake. Use it anyway so you can see the mechanism. Never paste a real token into a file you might commit, even once."),
          cmd(`printf '%s\\n' 'API_TOKEN=demo-not-real' > .env
printf '%s\\n' '.env' '*.log' > .gitignore
git status
git check-ignore -v .env`),
          expected(`Untracked files:
        .gitignore

.gitignore:1:.env    .env`),
          p(".env is missing from git status because the new ignore rule already matches it. Ignore rules apply to untracked files immediately. .gitignore itself is a normal file, and it is still untracked until you add it."),
          cmd(`git add .gitignore
git commit -m "Ignore env files and logs"
git status`),
        ],
      },
      {
        id: "git-ignore-2",
        title: "Track a log by mistake, then stop tracking it without deleting it",
        blocks: [
          p("Ignore rules do not untrack a file that is already in the repository. You are about to make that mistake on purpose, then undo the tracking."),
          cmd(`printf '%s\\n' 'started' > cafe.log
git add -f cafe.log
git commit -m "Accidentally track a log"
git rm --cached cafe.log
git status
ls cafe.log
git commit -m "Stop tracking cafe.log"
git status
git log --oneline -- cafe.log`),
          expected(`ls still prints cafe.log. The file is on disk.
After the second commit, git status is clean and cafe.log is not listed.
git log -- cafe.log still shows "Accidentally track a log".`),
          note("git add -f means \"track this even though a rule ignores it\". That is how the accident happens. git rm --cached removes the file from the index and leaves the working tree alone. The old commit still contains the file. Ignoring is not erasing history. If the token had been real, you would revoke it. Deleting the file from the latest commit would not be enough."),
        ],
      },
      {
        id: "git-ignore-3",
        title: "Use a bare folder as the remote",
        blocks: [
          p("A remote is another repository you can push to. GitHub is one. A bare repository on this machine is enough to learn push and clone, and it does not need an account. Bare means the folder holds Git's database and no working tree of its own."),
          cmd(`git init --bare "$HOME/drillbook-git.git"
git remote add origin "$HOME/drillbook-git.git"
git remote -v
git push -u origin main`),
          expected(`origin points at the bare folder, twice: one fetch URL and one push URL.
The push says it created a new branch, main, and set it as the upstream.`),
          warn("If git remote add says the remote already exists, you have done this step before. git remote remove origin, then add it again. If the bare folder is a previous attempt and you want to start that part over, remove only $HOME/drillbook-git.git, the folder you created for this drill."),
        ],
      },
      {
        id: "git-ignore-4",
        title: "Clone it somewhere else and prove what did not travel",
        blocks: [
          cmd(`git clone "$HOME/drillbook-git.git" "$HOME/drillbook-git-clone"
cd "$HOME/drillbook-git-clone"
git log --oneline
ls -a
git -C "$HOME/drillbook-git" log --oneline > /tmp/drillbook-log-a.txt
git -C "$HOME/drillbook-git-clone" log --oneline > /tmp/drillbook-log-b.txt
diff /tmp/drillbook-log-a.txt /tmp/drillbook-log-b.txt && echo "histories match"`),
          expected(`The clone's log shows the same subjects as the original.
ls -a does not list .env.
diff prints nothing, then the shell prints "histories match".
menu.txt is present. cafe.log is not in the working tree.`),
          p("The clone received commits, not your untracked files. .env was never committed, so it stayed in the original folder. cafe.log was committed and then removed, so the clone has the removal too. The accidental commit is still in git log -- cafe.log inside the clone. That is the history traveling with you."),
        ],
      },
    ],
    questions: [
      {
        q: "Why is a bare folder a fair stand-in for a host like GitHub in this lab?",
        a: "Push and clone talk to a repository, not to a website. The bare folder is a repository with no working files of its own, which is the shape a hosting service stores. The commands you practiced are the same ones you will use when origin is a URL.",
      },
      {
        q: "Why didn't .env show up in the clone?",
        a: "It was never part of a commit. Clone copies commits. An ignore rule only affects what Git offers to add. It is not a deletion, and it is not encryption.",
      },
      {
        q: "What did git rm --cached refuse to do?",
        a: "It refused to delete cafe.log from disk. It removed the file from the index so the next commit would stop tracking it. The earlier commit still has the contents.",
      },
    ],
    mistakes: [
      "Putting a real token in .env \"just to test\", then committing before the ignore file exists. Write the ignore rule first. And use a fake token.",
      "Expecting .gitignore to hide a file that is already tracked. You need git rm --cached, then a new commit.",
      "Quoting the tilde, as in \"~/drillbook-git.git\", inside a command that does not expand it. This drill uses $HOME so the path is expanded by the shell.",
      "Looking only at the latest commit and declaring the leaked file gone. git log -- cafe.log is the check.",
    ],
    checkpoint:
      "The two logs match, the clone has no .env, cafe.log is still on disk in the original folder, and git status there is clean.",
  },
];
