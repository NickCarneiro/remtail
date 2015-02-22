# remtail

tail out log files from multiple remote hosts

# install

With [npm](https://npmjs.org) do:

```
npm install -g remtail
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

Specify an alternate credentials file with -c.

# usage

```
remtail trillworks.com:/var/log/nginx/access.log okpedro.com:/var/log/apache2/other_vhosts_access.log
```

# development

```node test/test.js```

# license

MIT
