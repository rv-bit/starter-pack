This starter-pack will be using Cloudflare for domains etc, NGINX Proxy manager to configure reverse proxy these addresses.

# Initial requirements to run on the personal machine and to install any necessary updates through SSH
```
ssh root@<ipv4-address>
apt update && apt upgrade -y
```

# Adds user for deployment, you can name it anyway that you want but this should match everywhere, also this gives sudo access to user
```
adduser deploy-usr
usermod -aG sudo deploy-usr
```

# Docker installation and configuration for sudo access to user previously created
```
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker deploy-usr
```
## Optional - it is usually downloaded with get-docker.sh
```
apt install -y docker-compose-plugin
```
### Verification
```
docker --version
docker compose version
```

# Node and PM2 - Self explenatory, installs required node and pm2 for services and logs
```
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
```

# Configures Firewall for ports
```
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 81/tcp   # NPM (NGINX) admin UI
ufw enable
```

# Switching to deploy-usr and generating all necessary folders/files
```
su - deploy-usr
```

### Generate
```
mkdir -p ~/apps/
mkdir -p ~/tools 

touch ecosystem.config.cjs
nano ecosystem.config.cjs
```

```
module.exports = {
  apps: [
    {
      name: "app-name",
      script: "docker",
      args:
        "run --name app-name -p 3000:3000 --restart unless-stopped --env-file /home/deploy/apps/app-name/.env.production my-web-app:latest",
      interpreter: "none",
      restart_delay: 4000,
      max_restarts: 10,
    },
  ],
};
```

# NGINX Proxy Manager setup
```
cd ~/tools
mkdir -p data letsencrypt

nano docker-compose.yml
```

```
services:
  nginx-proxy-manager:
    image: 'jc21/nginx-proxy-manager:latest'
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
      - '81:81'
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    networks:
      - web
    extra_hosts:
      - "host.docker.internal:host-gateway"

networks:
  web:
    name: web
    driver: bridge
```

### Start service and check logs
```
docker compose up -d
docker compose logs -f
```

You should see NPM starting. Default admin login (first time):
- Email: admin@example.com
- Password: changeme

### PM2 Service start and save 
```
cd ..

pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

# Create app folder
This can be any name for the application specific, then for this choice it will use SQLite so we will create a data folder
Here we can use any database name but should be used across configurations

```
cd ~/apps
mkdir app-name

cd app-name
mkdir data

cd data
touch local.db
```

# Github Configuration
In your repo Settings → Secrets and variables → Actions, add:

- DO_HOST: your Droplet IP or domain IPV4
- DO_USER: SSH user - so in this case deploy-usr
- DO_SSH_KEY: private SSH key (OpenSSH format) that can log into the Droplet
- DO_HOST_FINGERPRINT: a SSH public key to the Host - On the server run ssh-keygen -lf /etc/ssh/ssh_host_ecdsa_key.pub | awk {print $2}'

### Generate a key
```
ssh-keygen -t ed25519 -C "github-actions" -f gh_actions_do_key -N ""
```
