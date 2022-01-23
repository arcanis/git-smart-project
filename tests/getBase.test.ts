import {PortablePath}                                         from '@yarnpkg/fslib';
import {expect}                                               from 'chai';
import {getBase, gitOne}                                      from 'git-smart-project';

import {TestEnvironment, makeTestEnvironment, writeAndCommit} from './helpers';

const defaultRepo = async (env: TestEnvironment) => {
  await writeAndCommit(env, `file1` as PortablePath, `file1`);
  await writeAndCommit(env, `file2` as PortablePath, `file2`);
  await writeAndCommit(env, `file3` as PortablePath, `file3`);
};

describe(`getBase`, () => {
  it(`should detect the base commit when branching out of master`, makeTestEnvironment(async env => {
    await defaultRepo(env);

    const commit = await gitOne(env.git, `rev-parse`, `HEAD`);

    await env.git(`checkout`, `-b`, `my/feature`);
    await writeAndCommit(env, `file4` as PortablePath, `file4`);

    await expect(getBase(env.git)).to.eventually.equal(commit);
  }));

  it(`should detect the right base even when master got merge since the feature started`, makeTestEnvironment(async env => {
    await defaultRepo(env);

    const commit = await gitOne(env.git, `rev-parse`, `HEAD`);
    await writeAndCommit(env, `file3` as PortablePath, `update`);

    await env.git(`checkout`, `-b`, `my/feature`, commit);
    await writeAndCommit(env, `file4` as PortablePath, `file4`);
    await env.git(`merge`, `master`);
    await writeAndCommit(env, `file5` as PortablePath, `file5`);

    await expect(getBase(env.git)).to.eventually.equal(commit);
  }));
});
