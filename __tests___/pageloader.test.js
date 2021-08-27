/* eslint-disable jest/no-commented-out-tests */
import os from 'os';
import fs from 'fs/promises';
import path from 'path';
import nock from 'nock';
import __dirname from '../src/dirname.js';
import pageLoader, { makeFileName } from '../index.js';

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

// const fixturePath = getFixturePath('sample.html');

const url = new URL('https://sample.com/path/to/site.html');

const dirprefix = path.join(os.tmpdir(), 'page-loader-');
const filename = 'sample-com-path-to-site.html';

// let expected;
let dirpath;
let filepath;

beforeEach(async () => {
  dirpath = await fs.mkdtemp(dirprefix);
  filepath = path.join(dirpath, filename);
});

test.each([
  ['https://google.com', 'google-com.html'],
  ['https://sample.com/path/to/site.html', 'sample-com-path-to-site.html'],
  ['https://ru.hexlet.io/courses', 'ru-hexlet-io-courses.html'],
])('makeFileName: %s', (urlString, expected) => {
  const input = new URL(urlString);
  const actual = makeFileName(input);
  expect(actual).toEqual(expected);
});

test.each([
  ['basic'],
  ['hexlet'],
])('pageLoader: %s', async (fixture) => {
  const inputPath = getFixturePath(`${fixture}-input.html`);
  const input = await fs.readFile(inputPath, 'utf-8');
  const scope = nock(url.origin)
    .get(url.pathname)
    .reply(200, input);

  const actual = await pageLoader(url.toString(), dirpath);
  const expected = filepath;

  expect(scope.isDone()).toBe(true);
  expect(actual).toEqual(expected);

  const actualSide = await fs.readFile(actual, 'utf-8');
  const expectedPath = getFixturePath(`${fixture}-output.html`);
  const expectedSide = await fs.readFile(expectedPath, 'utf-8');
  expect(actualSide).toEqual(expectedSide);
});
