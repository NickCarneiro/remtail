# remtail

tail out log files from multiple remote hosts

# install

With [npm](https://npmjs.org) do:

```
npm install -g remtail
```

You should set up a credentials file in ~/.remtail.json of this format:

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
    "password": "snakeinmyboot"
  }
]
```

You can specify an alternate credentials file with -c.

If you don't feel like having a file with all your passwords in it, send a pull request with ssh key support.

# usage

```
remtail nickc@tst-job1:/var/log/jasxA-tomcat/application-logentry.log nickc@tst-job1:/var/log/jasxA-tomcat/application-error.log tst-job2:/var/log/jasxA-tomcat/application-logentry.log
```

# development

```node tests/test.js```

# license

MIT
