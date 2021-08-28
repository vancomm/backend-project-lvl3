/* eslint-disable func-names */
/* eslint-disable max-len */
/* eslint-disable class-methods-use-this */

// ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
// "  https:   //    user   :   pass   @ sub.example.com : 8080   /p/a/t/h  ?  query=string   #hash "
// │          │  │          │          │    hostname     │ port │          │                │       │
// │          │  │          │          ├─────────────────┴──────┤          │                │       │
// │ protocol │  │ username │ password │          host          │          │                │       │
// ├──────────┴──┼──────────┴──────────┼────────────────────────┤          │                │       │
// │   origin    │                     │         origin         │ pathname │     search     │ hash  │
// ├─────────────┴─────────────────────┴────────────────────────┴──────────┴────────────────┴───────┤
// │                                              href                                              │
// └────────────────────────────────────────────────────────────────────────────────────────────────┘
// (All spaces in the "" line should be ignored. They are purely for formatting.)

import path from 'path';
import fs from 'fs/promises';
import axios from 'axios';
import cheerio from 'cheerio';

const normalize = (string) => string.replace(/[^\da-z]/gi, '-');

const isLocalLink = (link) => link.startsWith('/');

class PageLoader {
  constructor(urlString, dirpath = process.cwd()) {
    this.url = new URL(urlString);
    this.dirpath = dirpath;
  }

  makeFilename() {
    const hostname = normalize(this.url.hostname);
    const pathname = normalize(this.url.pathname.slice(1, this.url.pathname.indexOf('.')));
    const extension = this.url.pathname.slice(this.url.pathname.indexOf('.') + 1);
    if (extension === '') return `${hostname}-${pathname}.html`;
    return `${hostname}-${pathname}.${extension}`;
  }

  localizeLinks(html) {
    const { url } = this;
    const $ = cheerio.load(html);
    $('img').each(function () {
      const src = $(this).attr('src');
      if (isLocalLink(src)) {
        const filename = normalize(src);
        const pathname = path.dirname(url.pathname);
        const newSrc = src;
        $(this).attr('src', newSrc);
      }
    });
  }

  load() {
    const filename = this.makeFilename();
    const filepath = path.join(this.dirpath, filename);
    return axios.get(this.url.toString())
      .then((response) => fs.writeFile(filepath, response.data))
      .then(() => filepath)
      .catch((error) => {
        throw error;
      });
  }
}

export default PageLoader;
