# remtail

tail out log files from multiple remote hosts

![Image of example command](/remtail.png)

#  [![NPM version][npm-image]][npm-url][![Build Status](https://travis-ci.org/NickCarneiro/remtail.svg)](https://travis-ci.org/NickCarneiro/remtail)

# install!


```
npm install -g remtail
```

# basic usage

Connect to as many hosts as you want.

```
remtail trillworks.com:/var/log/nginx/access.log okpedro.com:/var/log/apache2/other_vhosts_access.log
```

Specify multiple files on the same host by repeating the hostname.

```
remtail trillworks.com:/var/log/nginx/access.log trillworks.com:/var/log/nginx/error.log
```

grep-like functionality with highlighting.

Only print lines containing "Comment", with "Comment" shown in red.
```
  remtail --grep "Comment" trillworks.com:/var/log/apache2/other_vhosts_access.log
```
For case insensitive search, use --grepi.
```
remtail --grepi "Comment" trillworks.com:/var/log/apache2/other_vhosts_access.log
```

You have full support for JavaScript regular expressions, so you can search for multiple strings like this:
```
remtail --grepi "GET|POST" trillworks.com:/var/log/apache2/other_vhosts_access.log
```


# advanced usage

To avoid typing in passwords for every host,
[copy your public key](http://askubuntu.com/questions/4830/easiest-way-to-copy-ssh-keys-to-another-machine)
to the remote servers. Then add entries in your ssh config. (~/.ssh/config). Here is the format:


    Host trillworks
        HostName trillworks.com
        User burt
        IdentityFile ~/.ssh/id_rsa

Specify an alternate ssh config with -s.


If you want to live dangerously, you can throw your passwords in a json credentials file (~/.remtail.json).

*WARNING: This is deprecated and will be removed in version 1.0.*


    [
      {
        "hostname": "trillworks.com",
        "port": 22,
        "user": "buzz",
        "password": "hunter2"
      },
      {
        "hostname": "globcong.com",
        "user": "woody",
        "privateKey": "/Users/woody/.ssh/id_rsa"
      }
    ]


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
