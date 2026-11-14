# Deploying to the VPS

The VPS keeps a Git clone of this repository in `/var/www/panoramix-site`, served as static files by Caddy.
On every push to `main` (i.e. every merged PR), the `Deploy to VPS` workflow connects over SSH and runs `git pull --ff-only`.

Two SSH keys are involved, each with a single job:

| Key | Lives on | Allows |
| --- | --- | --- |
| `panoramix_github` | VPS (`deploy` user) | Read-only access to this repo (GitHub deploy key) |
| `panoramix_actions` | GitHub secret `VPS_SSH_KEY` | Logging in as `deploy`, restricted to `git pull` |

## 1. Deploy user and folder (on the VPS)

```sh
sudo adduser --disabled-password --gecos "" deploy
sudo install -d -o deploy -g deploy -m 755 /var/www/panoramix-site
```

## 2. Read-only access to the repo (on the VPS)

```sh
sudo -iu deploy
ssh-keygen -t ed25519 -f ~/.ssh/panoramix_github -N "" -C "panoramix VPS read-only"
ssh-keyscan github.com >> ~/.ssh/known_hosts
cat ~/.ssh/panoramix_github.pub
```

Add the printed public key in GitHub: repository **Settings › Deploy keys › Add deploy key**, title `VPS`, leave "Allow write access" unchecked.

Then, still as `deploy`:

```sh
git -c core.sshCommand="ssh -i ~/.ssh/panoramix_github -o IdentitiesOnly=yes" \
  clone git@github.com:michaelwautier/panoramix-site.git /var/www/panoramix-site
git -C /var/www/panoramix-site config core.sshCommand "ssh -i ~/.ssh/panoramix_github -o IdentitiesOnly=yes"
exit
```

## 3. Caddy

Add this block to the Caddyfile (replace `203.0.113.10` with the VPS IP), then `sudo systemctl reload caddy`:

```caddyfile
http://203.0.113.10 {
	root * /var/www/panoramix-site

	# Never serve repository internals
	@private path /.git* /.github* /docs* /README.md
	respond @private 404

	encode zstd gzip
	file_server
}
```

The `http://` prefix serves plain HTTP on the IP (no certificate is possible for a bare IP with Let's Encrypt).
When a domain points to the VPS, replace the address with the domain to get automatic HTTPS.

## 4. Key for GitHub Actions

On your own machine:

```sh
ssh-keygen -t ed25519 -f ./panoramix_actions -N "" -C "panoramix GitHub Actions deploy"
cat ./panoramix_actions.pub
```

On the VPS, append the public key to `/home/deploy/.ssh/authorized_keys` with a forced command, on one line:

```
restrict,command="git -C /var/www/panoramix-site pull --ff-only --quiet" ssh-ed25519 AAAA... panoramix GitHub Actions deploy
```

```sh
sudo -iu deploy
nano ~/.ssh/authorized_keys   # paste the line above
chmod 600 ~/.ssh/authorized_keys
exit
```

## 5. GitHub secrets

Repository **Settings › Secrets and variables › Actions**, or with the GitHub CLI from your machine:

```sh
gh secret set VPS_HOST --body "203.0.113.10"
gh secret set VPS_USER --body "deploy"
gh secret set VPS_SSH_KEY < ./panoramix_actions
ssh-keyscan -p 22 203.0.113.10 | gh secret set VPS_KNOWN_HOSTS
# Only if SSH does not listen on 22:
# gh secret set VPS_PORT --body "2222"
```

Then delete the local private key: `rm ./panoramix_actions ./panoramix_actions.pub`.

## 6. Test

Run the workflow by hand: **Actions › Deploy to VPS › Run workflow**, then open `http://<VPS IP>`.
Check that `http://<VPS IP>/.git/config` returns 404.
