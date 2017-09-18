# Cloudflare Origin CA Bot
### cfcabot

This is a client, inspired by [Let's Encrypt](https://letsencrypt.org)'s `certbot`, which makes it easy to request and
automatically renew [Cloudflare Origin CA](https://blog.cloudflare.com/cloudflare-ca-encryption-origin/) certificates.

**This only works on Linux.**

# Installation

Install [Node.js](https://nodejs.org) v6 or later. Then install it via npm:

    $ sudo npm install -g cloudflare-ca-bot
    
Finally, run it (as any user):

    $ cfcabot
    
Command syntax:

    $ cfcabot <command> [flags]

Available commands:
- `apikey`: Set or update your [Cloudflare CA API key](https://www.cloudflare.com/a/profile) (you will need to do this first)
- `list`: List all certificates known to this machine (all these certs will be renewed when you use "renew")
- `new`: Interactively get a new certificate (you will want to start here once you set your API key)
    - The output of this command will tell you where on the file system you can find your private key and certificate
- `renew`: Non-interactively renew all certificates that need renewal (all certs that expire in 14 or fewer days)
    - Use `--force` flag to force renewal of all certificates regardless of whether renewal is needed
    - It is completely safe (and recommended) to use this command more frequently than needed. It will only make requests
    to Cloudflare if the certificate will imminently expire (it checks the local disk to know when it expires). It would
    be a good idea to run `renew` daily on a cronjob.
- `revoke`: Interactively revoke a certificate

# Security

This application is designed assuming that you fully control the operating system on which you use it. All certificates
and private keys are stored in `/etc/cfcabot` which is accessible to any user on the system (so that you can run
`cfcabot` as an unprivileged user and still have the keys accessible to your webserver). Your Cloudflare Origin CA API
key is stored in your user's home directory, however.


