# StudyInc

This is the repository for the frontend of [StudyInc](https://petstroy.info), an unblocked game site I've been making. It is purposefully designed such that the code is inconspicuous to any AI model looking at the source code of the site.

This repository does not include several elements, including:
- The games themselves
- The online user tracker / statistics endpoint (available [here](https://codeberg.org/dragin/studyinc-olu))
- The AI ("calculator") endpoint (available [here](https://codeberg.org/dragin/studyinc-calc))
- The accounts backend (available [here](https://codeberg.org/PlatinumLabs/amethyst))
- The savedata endpoint (available [here](https://codeberg.org/dragin/studyinc-save))

# Self-Hosting

This guide will show you how to set up the entire site on your own server.

## Local setup

1. Clone this repository
2. Install pnpm (assuming you have npm, you can install it with `npm i -g pnpm`)
3. Modify the commands `deploy` and `deploy-test` in the file `package.json` such that it deploys to whatever your server IP is rather than "doofus"
4. Run `pnpm i`

## Server setup

1. Create the directory `/opt/studyinc`
2. Ensure rsync is installed
3. LOCALLY, run `pnpm run deploy`, which will build the site and copy it to the server using rsync
4. Run `sudo apt install caddy go` and `go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest`
5. Custom-build Caddy with `xcaddy build --with github.com/caddyserver/replace-response`, then copy the outputted file to /usr/bin. You will also need to rebuild whenever Caddy updates or it'll error out and the site will break
6. Copy the Caddyfile in the "installation" folder in this repo to /etc/caddy
7. Reload caddy

The site should now technically "work", but it won't have any games or anything.

## Adding Games

1. Create the directories `/opt/studyinc/games/repos` and `/opt/studyinc/games/res/thumbs`. The repos folder will have the games themselves (cloned Git repos for better version control) and the res folder will have ID symlinks as well as the master index.json and images.
2. Clone your game to `/opt/studyinc/games/repos/[name-of-game]`
3. Create a symlink to the game with a numeric ID with `ln -s /opt/studyinc/games/repos/[name-of-game] /opt/studyinc/games/res/[id]`
4. Add your game to index.json. You need to encrypt the title using the enc.py program and, if you want to, put a fake title like "rawTitle," which can trick AI models into not thinking it's necessary to decode the title. An example index.json is also in the "installation" folder in this repo. Some games will look weird unless you specify an aspect ratio, though typically you don't need to specify one.
5. Add a 3:4 vertical thumbnail for the game at `/opt/studyinc/games/repos/thumbs/[id]/vert.jpg`. You can easily find vertical thumbnails at [SteamGridDB](https://www.steamgriddb.com/), or just make them yourself if they don't have one

## MOTD

Simplest thing, literally just make a file at `/opt/studyinc/api/motd/index.html` and write whatever message you want

# All the other setup steps are in the READMEs of the repos listed near the top