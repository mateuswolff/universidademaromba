"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const Server = require("./lib/Server");

async function main() {
  process.env.TZ =  'America/Sao_Paulo';
  Object.defineProperty(Array.prototype, 'groupBy', {
    enumerable: false,
    value: function (key) {
      let map = {};
      this.map(e => ({k: key(e), d: e})).forEach(e => {
        map[e.k] = map[e.k] || [];
        map[e.k].push(e.d);
      });
      return Object.keys(map).map(k => ({key: k, data: map[k]}));
    }
  });

  await Server.App.i.main();
}
main();