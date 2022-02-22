import {PortablePath}                                         from '@yarnpkg/fslib';
import {expect}                                               from 'chai';
import {getChangedFiles}                                      from 'git-smart-project';

import {TestEnvironment, makeTestEnvironment, writeAndCommit} from './helpers';

const defaultRepo = async (env: TestEnvironment) => {
  await writeAndCommit(env, `file1` as PortablePath, `file1`);
  await writeAndCommit(env, `file2` as PortablePath, `file2`);
  await writeAndCommit(env, `file3` as PortablePath, `file3`);
};

describe(`getChangedFiles`, function () {
  this.timeout(20000);

  it(`should detect new files in feature branch (commited)`, makeTestEnvironment(async env => {
    await defaultRepo(env);

    await env.git(`checkout`, `-b`, `my/feature`);
    await writeAndCommit(env, `file4` as PortablePath, `file4`);

    await expect(getChangedFiles(env.git)).to.eventually.deep.equal([
      {file: `file4`, status: `A`},
    ]);
  }));

  it(`should detect new files in feature branch (staged)`, makeTestEnvironment(async env => {
    await defaultRepo(env);

    await env.git(`checkout`, `-b`, `my/feature`);
    await env.fs.writeFilePromise(`file4` as PortablePath, `file4`);
    await env.git(`add`, `-A`);

    await expect(getChangedFiles(env.git)).to.eventually.deep.equal([
      {file: `file4`, status: `A`},
    ]);
  }));

  it(`should detect new files in feature branch (untracked)`, makeTestEnvironment(async env => {
    await defaultRepo(env);

    await env.git(`checkout`, `-b`, `my/feature`);
    await env.fs.writeFilePromise(`file4` as PortablePath, `update`);

    await expect(getChangedFiles(env.git)).to.eventually.deep.equal([
      {file: `file4`, status: `?`},
    ]);
  }));

  it(`should detect new files in feature branch (working tree)`, makeTestEnvironment(async env => {
    await defaultRepo(env);

    await env.git(`checkout`, `-b`, `my/feature`);
    await writeAndCommit(env, `file4` as PortablePath, `file4`);

    await expect(getChangedFiles(env.git)).to.eventually.deep.equal([
      {file: `file4`, status: `A`},
    ]);
  }));

  it(`should detect modified files in feature branch (commited)`, makeTestEnvironment(async env => {
    await defaultRepo(env);

    await env.git(`checkout`, `-b`, `my/feature`);
    await writeAndCommit(env, `file3` as PortablePath, `update`);

    await expect(getChangedFiles(env.git)).to.eventually.deep.equal([
      {file: `file3`, status: `M`},
    ]);
  }));

  it(`should detect modified files in feature branch (staged)`, makeTestEnvironment(async env => {
    await defaultRepo(env);

    await env.git(`checkout`, `-b`, `my/feature`);
    await env.fs.writeFilePromise(`file3` as PortablePath, `update`);
    await env.git(`add`, `-A`);

    await expect(getChangedFiles(env.git)).to.eventually.deep.equal([
      {file: `file3`, status: `M`},
    ]);
  }));

  it(`shouldn't report changes when master just has more commits than the feature branch`, makeTestEnvironment(async env => {
    await defaultRepo(env);

    await env.git(`branch`, `my/feature`, `master`);
    await writeAndCommit(env, `file4` as PortablePath, `file4`);
    await env.git(`checkout`, `my/feature`);

    await expect(getChangedFiles(env.git)).to.eventually.deep.equal([]);
  }));
});
