# node.js v15.7.0 QUIC Tester

see https://zenn.dev/yamayuski/scraps/f923ef3e776c13

## Prerequisites

### Certs

```sh
$ openssl genrsa 2024 > server.key
$ openssl req -new -key server.key -subj "/C=JP" > server.csr
$ openssl x509 -req -days 3650 -signkey server.key < server.csr > server.crt
```

## References

* [(再)node.js v15 で QuicTransport 試してみよう](https://zenn.dev/yamayuski/scraps/f923ef3e776c13)
* [node/quic.md at 7657f62b1810b94acbe7db68089b608213b34749 · nodejs/node](https://github.com/nodejs/node/blob/7657f62b1810b94acbe7db68089b608213b34749/doc/api/quic.md)
* [il-m-yamagishi/nodejs-quic-sample: node.js v15.7.0 QUIC sample](https://github.com/il-m-yamagishi/nodejs-quic-sample)
* [node/quic.js at 7657f62b1810b94acbe7db68089b608213b34749 · nodejs/node](https://github.com/nodejs/node/blob/7657f62b1810b94acbe7db68089b608213b34749/test/common/quic.js)
* [Node.jsのHTTP over QUIC(HTTP/3)を試す | WEB EGG](https://blog.leko.jp/post/http-over-quic-on-nodejs15/)
* [node/test-quic-client-server.js at 7657f62b1810b94acbe7db68089b608213b34749 · nodejs/node](https://github.com/nodejs/node/blob/7657f62b1810b94acbe7db68089b608213b34749/test/parallel/test-quic-client-server.js)
* [Node.jsのQUICを先取りして使ってみよう - nwtgck / Ryo Ota](https://scrapbox.io/nwtgck/Node.js%E3%81%AEQUIC%E3%82%92%E5%85%88%E5%8F%96%E3%82%8A%E3%81%97%E3%81%A6%E4%BD%BF%E3%81%A3%E3%81%A6%E3%81%BF%E3%82%88%E3%81%86)
* [Util | Node.js v16.6.1 Documentation](https://nodejs.org/dist/latest-v16.x/docs/api/util.html#util_util_debuglog_section_callback)
