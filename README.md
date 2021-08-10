# node.js v15.7.0 QUIC Tester

see https://zenn.dev/yamayuski/scraps/f923ef3e776c13

## Prerequisites

### Certs

```sh
$ openssl genrsa 2024 > server.key
$ openssl req -new -key server.key -subj "/C=JP" > server.csr
$ openssl x509 -req -days 3650 -signkey server.key < server.csr > server.crt
```
