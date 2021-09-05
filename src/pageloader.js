/* eslint-disable array-callback-return */
/* eslint-disable func-names */
/* eslint-disable max-len */
/* eslint-disable class-methods-use-this */

import _ from 'lodash';
import path from 'path';
import fs from 'fs';
import fsp from 'fs/promises';
import axios from 'axios';
import cheerio from 'cheerio';

const hyphenize = (...strings) => strings.map((string) => string.replace(/[^\da-z_]/gi, '-')).filter((string) => !_.isEmpty(string)).join('-');

const isLocalLink = (link) => link.startsWith('/');

const downloadImage = (url, savePath) => new Promise((resolve, reject) => {
  axios({
    url,
    method: 'GET',
    responseType: 'stream',
  })
    .then(((response) => {
      response.data.pipe(fs.createWriteStream(savePath));
      resolve();
    }))
    .catch((err) => {
      reject(new Error(err, url));
    });
});

const processFile = () => {

};

const pageLoader = (urlString, dirpath) => {
  const url = new URL(urlString);

  const filename = hyphenize(url.hostname, url.pathname.slice(1).replace('.html', ''));
  const filepath = path.join(dirpath, filename.endsWith('.html') ? filename : `${filename}.html`);
  const filesDirpath = path.join(dirpath, `${filename}_files`);
  const filesPrefix = hyphenize(url.hostname, path.dirname(url.pathname).slice(1));
  const filesURLPrefix = new URL(path.dirname(url.pathname), url.origin);

  return fsp.mkdir(filesDirpath)
    .then(() => axios.get(url.href))
    .then(({ data }) => cheerio.load(data))
    .then(($) => {
      $('img').map(function () {
        const src = $(this).attr('src');
        if (isLocalLink(src)) {
          const link = new URL(src, filesURLPrefix);
          const [name, extension] = path.basename(src).split('.');
          const savePath = path.join(filesDirpath, `${hyphenize(filesPrefix, name)}.${extension}`);
          console.log(link.href);
          console.log(savePath);
          $(this).attr('src', 'new value =)');
          downloadImage(link.href, savePath);
        }
      });
      return $;
    })
    .then(($) => console.log($.root().html()))
    .then(() => filepath);
};

// console.log(pageLoader('https://ru.hexlet.io/courses', '/home/vancomm'));

export default pageLoader;
