# git-smart-project

> Collection of smarter Git utilities

[![](https://img.shields.io/npm/v/git-smart-project.svg)]() [![](https://img.shields.io/npm/l/git-smart-project.svg)]() [![](https://img.shields.io/badge/developed%20with-Yarn%203-blue)](https://github.com/yarnpkg/berry)

## Installation

```
yarn add git-smart-project
```

## API

### `getBase(git: GitFn, opts: {...}): Promise<string>`

Returns the point from where the current branch originates.

### `getChangedFiles(git: GitFn, opts: {...}): Promise<GitStatus[]>`

Returns the list of changed files in the current branch, compared its base.

### `getFiles(git: GitFn, opts: {...}): Promise<string>`

Returns the list of files in the current checkout, including untracked file (but not the gitignored ones).

## License (MIT)

> **Copyright © 2021 Maël Nison**
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
