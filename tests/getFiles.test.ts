import {PortablePath}                                         from '@yarnpkg/fslib';
import {expect}                                               from 'chai';
import {getFiles, gitOne}                                     from 'git-smart-project';

import {TestEnvironment, makeTestEnvironment, writeAndCommit} from './helpers';

const defaultRepo = async (env: TestEnvironment) => {
  await writeAndCommit(env, `file1` as PortablePath, `file1`);
  await writeAndCommit(env, `file2` as PortablePath, `file2`);
  await writeAndCommit(env, `file3` as PortablePath, `file3`);
};

describe(`getFiles`, function () {
  this.timeout(20000);

  it(`should list all files in the current repository`, makeTestEnvironment(async env => {
    await defaultRepo(env);

    await expect(getFiles(env.git)).to.eventually.deep.equal([
      `file1`,
      `file2`,
      `file3`,
    ]);
  }));

  it(`should also list untracked files`, makeTestEnvironment(async env => {
    await defaultRepo(env);

    await env.fs.writeFilePromise(`file2.1` as PortablePath, `file2.1`);

    await expect(getFiles(env.git)).to.eventually.deep.equal([
      `file1`,
      `file2`,
      `file2.1`,
      `file3`,
    ]);
  }));

  it(`shouldn't list deleted files`, makeTestEnvironment(async env => {
    await defaultRepo(env);

    await env.fs.unlinkPromise(`file2` as PortablePath);

    await expect(getFiles(env.git)).to.eventually.deep.equal([
      `file1`,
      `file3`,
    ]);
  }));

  it(`shouldn't list gitignored files`, makeTestEnvironment(async env => {
    await defaultRepo(env);

    await env.fs.writeFilePromise(`.gitignore` as PortablePath, `file2.1\n`);
    await env.fs.writeFilePromise(`file2.1` as PortablePath, `file2.1`);

    await expect(getFiles(env.git)).to.eventually.deep.equal([
      `.gitignore`,
      `file1`,
      `file2`,
      `file3`,
    ]);
  }));

  it(`can be restricted to specific patterns`, makeTestEnvironment(async env => {
    await defaultRepo(env);

    await env.fs.writeFilePromise(`file21` as PortablePath, `file21`);
    await env.fs.writeFilePromise(`file22` as PortablePath, `file22`);
    await env.fs.writeFilePromise(`file23` as PortablePath, `file23`);

    await expect(getFiles(env.git, {pattern: `file2*`})).to.eventually.deep.equal([
      `file2`,
      `file21`,
      `file22`,
      `file23`,
    ]);
  }));

  it(`accepts braces in its glob patterns`, makeTestEnvironment(async env => {
    await defaultRepo(env);

    await expect(getFiles(env.git, {pattern: `file{1,3}`})).to.eventually.deep.equal([
      `file1`,
      `file3`,
    ]);
  }));
});
