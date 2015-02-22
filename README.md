# remtail

tail out log files from multiple remote hosts

![Image of example command](/remtail.png)

#  [![NPM version][npm-image]][npm-url][![Build Status](https://travis-ci.org/NickCarneiro/remtail.svg)](https://travis-ci.org/NickCarneiro/remtail)

# install


```
npm install -g remtail
```

# usage

Connect to as many hosts as you want.

```
remtail trillworks.com:/var/log/nginx/access.log okpedro.com:/var/log/apache2/other_vhosts_access.log
```

Specify multiple files on the same host by repeating the hostname.

```
remtail trillworks.com:/var/log/nginx/access.log trillworks.com:/var/log/nginx/error.log
```

You can optionally use a credentials file in ~/.remtail.json of this format:

```
[
  {
    "hostname": "trillworks.com"
    "port": 22,
    "user": "buzz",
    "password": "hunter2"
  },
  {
    "hostname": "indeed.com",
    "user": "woody",
    "privateKey": "/Users/woody/.ssh/id_rsa"
  }
]
```

Specify an alternate credentials file path with -c.

# development

## unit tests

```node test/test.js```

## linter

```npm run-script jshint```

# license

MIT


[npm-url]: https://npmjs.org/package/remtail
[npm-image]: https://badge.fury.io/js/remtail.svg