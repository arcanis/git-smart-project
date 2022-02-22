const defaultReferenceBranches = [`upstream/main`, `origin/main`, `main`, `upstream/master`, `origin/master`, `master`];

export type GitFn = (...args: Array<string>) => Promise<{stdout: string, stderr: string}>;

export enum GitStatus {
  Added = `A`,
  Deleted = `D`,
  Modified = `M`,
  Untracked = `?`,
}

export async function gitOne(git: GitFn, ...args: Array<string>) {
  const result = await git(...args);
  return result.stdout.trim();
}

export async function gitAll(git: GitFn, ...args: Array<string>) {
  const result = await gitOne(git, ...args);
  return result ? result.split(/\n/) : [];
}

export async function getBase(git: GitFn, {referenceBranches = defaultReferenceBranches}: {referenceBranches?: Array<string>, remotePriorities?: Array<string>} = {}) {
  const results = await Promise.allSettled(referenceBranches.map(async candidate => {
    const uniqueCommits = await gitAll(git, `log`, `--reverse`, `--format=%H`, `--first-parent`, `${candidate}..HEAD`);
    return await gitOne(git, `rev-parse`, uniqueCommits.length > 0 ? `${uniqueCommits[0]}^` : `HEAD`);
  }));

  const candidates = results
    .filter((result): result is PromiseFulfilledResult<string> => result.status === `fulfilled`)
    .map(result => result.value);

  if (candidates.length === 0) {
    throw new Error(`Failed to locate a proper base for the current branch`);
  } else {
    return candidates[0];
  }
}

export async function getChangedFiles(git: GitFn, {referenceBranches}: {referenceBranches?: Array<string>} = {}) {
  const mergeBase = await getBase(git, {referenceBranches});

  const [tracked, untracked] = await Promise.all([
    gitAll(git, `diff`, `--name-status`, `--no-renames`, `--diff-filter=ADM`, mergeBase),
    gitAll(git, `ls-files`, `--others`, `--exclude-standard`),
  ]);

  return tracked.map(entry => {
    const [status, file] = entry.split(/\t/);
    return {status: status as GitStatus, file};
  }).concat(untracked.map(file => {
    return {status: GitStatus.Untracked, file};
  }));
}
