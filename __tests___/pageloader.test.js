/* eslint-disable jest/no-commented-out-tests */
import os from 'os';
import fs from 'fs/promises';
import path from 'path';
import nock from 'nock';
import __dirname from '../src/dirname.js';
import PageLoader from '../index.js';

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

const url = new URL('https://sample.com/path/to/site.html');

const dirprefix = path.join(os.tmpdir(), 'page-loader-');
const filename = 'sample-com-path-to-site.html';

let dirpath;
let filepath;

beforeEach(async () => {
  dirpath = await fs.mkdtemp(dirprefix);
  filepath = path.join(dirpath, filename);
});

test.each([
  ['basic'],
  ['hexlet'],
])('pageLoader: %s', async (fixture) => {
  const pageLoader = new PageLoader(url.toString(), dirpath);

  const inputPath = getFixturePath(`${fixture}-input.html`);
  const input = await fs.readFile(inputPath, 'utf-8');
  const scope = nock(url.origin)
    .get(url.pathname)
    .reply(200, input);

  const actual = await pageLoader.load(url.toString(), dirpath);
  const expected = filepath;

  expect(scope.isDone()).toBe(true);
  expect(actual).toEqual(expected);

  const actualSide = await fs.readFile(actual, 'utf-8');
  const expectedPath = getFixturePath(`${fixture}-output.html`);
  const expectedSide = await fs.readFile(expectedPath, 'utf-8');
  expect(actualSide).toEqual(expectedSide);
});
