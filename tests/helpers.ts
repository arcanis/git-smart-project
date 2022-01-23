import {CwdFS, FakeFS, npath, PortablePath, xfs} from '@yarnpkg/fslib';
import chaiAsPromised                            from 'chai-as-promised';
import chai                                      from 'chai';
import {execFile}                                from 'child_process';
import {GitFn, gitOne}                           from 'git-smart-project';
import {promisify}                               from 'util';

chai.use(chaiAsPromised);

const spawnP = promisify(execFile);

export type TestEnvironment = {
  fs: FakeFS<PortablePath>;
  git: GitFn;
};

export function makeTestEnvironment(cb: (env: TestEnvironment) => Promise<void>) {
  return async () => {
    await xfs.mktempPromise(async p => {
      const fs = new CwdFS(p, {baseFs: xfs});
      const git = async (...args: Array<string>) => spawnP(`git`, args, {
        cwd: npath.fromPortablePath(p),
        encoding: `utf8`,
      });

      await git(`init`);
      await git(`config`, `user.name`, `John Doe`);
      await git(`config`, `user.email`, `john.doe@example.org`);
      await git(`commit`, `--allow-empty`, `-m`, `First commit`);

      await cb({fs, git});
    });
  };
}

export async function writeAndCommit({fs, git}: TestEnvironment, p: PortablePath, content: string) {
  const currentBranch = await gitOne(git, `rev-parse`, `--abbrev-ref`, `HEAD`);

  await fs.writeFilePromise(p, content);
  await git(`add`, `-A`);
  await git(`commit`, `-am`, `Commit on ${currentBranch}`);
}
