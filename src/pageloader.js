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

class PageLoader {
  constructor(urlString, dirpath = process.cwd()) {
    this.url = new URL(urlString);
    this.dirpath = dirpath;
  }

  getNormalizedBasename() {
    return normalize(this.url.hostname);
  }

  makeFilename() {
    const basename = this.getNormalizedBasename();
    const pathname = normalize(this.url.pathname.slice(1, this.url.pathname.indexOf('.')));
    const extension = this.url.pathname.slice(this.url.pathname.indexOf('.') + 1);
    if (extension === '') return `${basename}-${pathname}.html`;
    return `${basename}-${pathname}.${extension}`;
  }

  localizeLinks(html) {
    const $ = cheerio.load(html);
    $('img').map((i, img) => {
      const oldSrc = $(img).attr('src');
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
