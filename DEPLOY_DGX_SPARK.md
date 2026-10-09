# Running mPod on the NVIDIA DGX Spark

This guide sets up the whole application on one DGX Spark: the website, the admin portal, the API, the database and the AI models (through Ollama). OpenAI can stay as an automatic backup.

**Prerequisite:** commands are for DGX OS (Ubuntu 24.04, ARM64) and are run in a terminal on the Spark. Lines starting with `sudo` need an administrator account.

```
                     Internet / campus network
                                │  HTTPS (443)
┌───────────────────────────────▼──────────────────────────────────┐
│ DGX Spark                                                         │
│  nginx ──► /          student website + kiosk (static files)      │
│        ──► /admin/    admin portal (static files)                 │
│        ──► /backend/  Node API (127.0.0.1:8002) ──► MongoDB       │
│                                     │              (127.0.0.1)    │
│                                     ├──► Ollama (127.0.0.1:11434) │
│                                     │      gpt-oss:120b / 20b,    │
│                                     │      qwen3-coder:30b on GPU │
│                                     └──► OpenAI (backup, optional)│
└───────────────────────────────────────────────────────────────────┘
```

---

## What the code now supports

| Feature | How it works | Setting (`backend/.env`) |
|---|---|---|
| Choose the AI provider | `ollama` or `openai`; nothing else in the app changes | `AI_PROVIDER` |
| Automatic backup | If the primary fails (unreachable, model missing, overloaded, key rejected), each request goes to the backup. The failed provider is skipped for 60 s, then re-checked every minute until it recovers. | `AI_FALLBACK_PROVIDER` (`none` = never use another provider) |
| One model per task | Question generation, answer scoring, interview summary and coding evaluation each have their own model | `OLLAMA_*_MODEL`, `OPENAI_*_MODEL` |
| GPU protection | At most N requests at a time go to Ollama. Requests where a student is waiting (question generation, idea check) are served before background scoring. | `OLLAMA_MAX_CONCURRENCY` |
| Reasoning models | gpt-oss thinks at "low" effort and gets extra tokens for it. Other models answer directly, so the JSON answer is never cut off. | `OLLAMA_THINK`, `OLLAMA_REASONING_TOKENS` |
| Warm start | The models are loaded into GPU memory when the backend starts | `OLLAMA_PRELOAD` |
| Clear diagnostics | The admin banner names the provider, the problem and the exact fix (for example `ollama pull gpt-oss:120b`) | — |
| Audit trail | Every evaluation stores which provider and models scored it, the number of calls, tokens and time (`evaluation_ai` on the interview) | — |
| Setup check | `npm run ai:check` tests every provider and every task, with timings | — |
| Quality check | `npm run ai:calibrate` scores the same answers with each provider and compares them | — |
| Existing safety net | If every provider is down, interviews still run: bank questions are used, scores are provisional, and the AI re-scores them later | — |

---

## Step 1: Decide these first

| Decision | Options | Recommendation |
|---|---|---|
| How students reach it | (a) a public domain name pointing to the Spark; (b) Cloudflare Tunnel if the Spark has no public IP; (c) campus network only | (a) or (b). Students and kiosks need **HTTPS**, or the browser blocks the camera and microphone. |
| Database | (a) keep your current MongoDB; (b) move the data to the Spark | (b) keeps everything on one machine, but you then own backups (step 11). With (a), skip step 5. |
| Backup AI | OpenAI as fallback, or none | Keep OpenAI as the fallback for the first weeks, then decide. With `none`, no interview data leaves your network (except speech recognition, see "Known limits"). |

---

## Step 2: Prepare the machine

```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install git nginx certbot curl gnupg ufw

# Node.js 20 LTS (ARM64 build)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt -y install nodejs
node -v   # v20.x

# A dedicated user that runs the app
sudo useradd --system --create-home --home-dir /opt/mpod --shell /bin/bash mpod
```

---

## Step 3: Copy the code

The repository has no remote yet. Use either option:

```bash
# Option A (recommended): push the repo to a private GitHub/GitLab repo, then on the Spark:
sudo -u mpod git clone <your-private-repo-url> /opt/mpod/app-tmp
sudo -u mpod bash -c 'shopt -s dotglob; mv /opt/mpod/app-tmp/* /opt/mpod/ && rmdir /opt/mpod/app-tmp'

# Option B: copy from your Mac (run this on the Mac; skips dependencies and secrets)
rsync -av --exclude node_modules --exclude '.env*' --exclude build --exclude backend/.dev-db \
  --exclude _pii_quarantine ~/Documents/mPod/ <user>@<spark-host>:/tmp/mpod/
# then on the Spark:  sudo rsync -a /tmp/mpod/ /opt/mpod/ && sudo chown -R mpod:mpod /opt/mpod
```

---

## Step 4: Ollama and the models

Ollama is already installed. Configure it for mPod, then download the models (about 100 GB in total).

```bash
ollama --version
sudo mkdir -p /etc/systemd/system/ollama.service.d
sudo cp /opt/mpod/deploy/dgx-spark/ollama/override.conf /etc/systemd/system/ollama.service.d/override.conf
sudo systemctl daemon-reload && sudo systemctl restart ollama

ollama pull gpt-oss:120b      # answer scoring          (~65 GB)
ollama pull gpt-oss:20b       # questions + summary     (~14 GB)
ollama pull qwen3-coder:30b   # coding evaluation       (~19 GB)
ollama list
```

What the override does:
- Ollama only listens on `127.0.0.1`.
- 4 requests are served in parallel.
- All 3 models are kept loaded.
- It uses a smaller, faster memory format.

Ollama is reached only from the Spark itself and never exposed to the network.

**If memory is tight** (other workloads on the Spark), use `gpt-oss:20b` for scoring as well. It is faster and needs about 65 GB less memory, with slightly lower scoring quality. Compare the two with `ai:calibrate` (step 10).

**If Ollama runs in Docker** instead of as a service, pass the same settings with `-e`, and publish the port only locally: `-p 127.0.0.1:11434:11434`.

---

## Step 5: MongoDB (skip if you keep your current database)

```bash
# MongoDB 8.0 for Ubuntu 24.04 ARM64
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor
echo "deb [ arch=arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
sudo apt update && sudo apt -y install mongodb-org

sudo cp /opt/mpod/deploy/dgx-spark/mongodb/mongod.conf /etc/mongod.conf
sudo systemctl enable --now mongod

# 1. Start the single-node replica set (needed for credit transactions)
mongosh --eval 'rs.initiate({_id: "rs0", members: [{_id: 0, host: "127.0.0.1:27017"}]})'

# 2. Create the users (choose strong passwords)
mongosh --eval '
  db.getSiblingDB("admin").createUser({user: "root", pwd: passwordPrompt(), roles: ["root"]});
  db.getSiblingDB("admin").createUser({user: "mpod_backup", pwd: passwordPrompt(), roles: ["backup"]});
  db.getSiblingDB("mpod").createUser({user: "mpod_app", pwd: passwordPrompt(), roles: [{role: "readWrite", db: "mpod"}]});
'

# 3. Turn on authentication
sudo mkdir -p /etc/mongodb
openssl rand -base64 756 | sudo tee /etc/mongodb/keyfile >/dev/null
sudo chown mongodb:mongodb /etc/mongodb/keyfile && sudo chmod 400 /etc/mongodb/keyfile
sudo sed -i 's/^#security:/security:/; s/^#  authorization/  authorization/; s/^#  keyFile/  keyFile/' /etc/mongod.conf
sudo systemctl restart mongod
mongosh "mongodb://root@127.0.0.1:27017/?authSource=admin" --eval 'rs.status().ok'   # prints 1
```

---

## Step 6: Backend settings

Create the backend settings from the template and fill in every `<...>` value (the database password is the `mpod_app` password from step 5):

```bash
sudo -u mpod cp /opt/mpod/deploy/dgx-spark/backend.env.example /opt/mpod/backend/.env
sudo -u mpod chmod 600 /opt/mpod/backend/.env
sudo -u mpod nano /opt/mpod/backend/.env
```

- **`JWT_SECRET`:** generate a new one with `openssl rand -base64 48`. The current one is too short; changing it signs everyone out once.
- **Email and the OpenAI key:** copy them from your current `backend/.env`.

---

## Step 7: Data

**Fresh start:** nothing to do. Create the first platform admin as you do today.

**Moving existing data:** you run these commands; I have not touched your production database.

```bash
# On a machine that can reach the current database:
mongodump --uri="<current MONGODB_URI>" --gzip --archive=mpod-prod.archive.gz
# Copy the file to the Spark, then:
mongorestore --uri="mongodb://root@127.0.0.1:27017/?authSource=admin" --gzip --archive=mpod-prod.archive.gz \
  --nsFrom='<old-db-name>.*' --nsTo='mpod.*'
```

Also copy the uploaded files (profile pictures, technology and module icons) from the current server:
- `backend/src/uploads/profile-pics/` → `/opt/mpod/backend/src/uploads/profile-pics/`
- `backend/uploads/` → `/opt/mpod/backend/uploads/`

Then run the one-time migration (credit ledger opening balances, indexes). Run it once to preview, then again with `--apply`:

```bash
cd /opt/mpod/backend
sudo -u mpod NODE_ENV=production node scripts/migrate.js            # dry run: shows what would change
sudo -u mpod NODE_ENV=production node scripts/migrate.js --apply
```

---

## Step 8: Build and start the application

```bash
sudo -u mpod /opt/mpod/deploy/dgx-spark/scripts/deploy.sh      # installs dependencies, builds both websites

sudo cp /opt/mpod/deploy/dgx-spark/systemd/mpod-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now mpod-backend
journalctl -u mpod-backend -f
```

The startup log should show:
- `Connected to DB (127.0.0.1:27017)`
- `[ai] provider: Ollama (http://127.0.0.1:11434; scoring=gpt-oss:120b, ...) -> fallback OpenAI (...)`
- `[ai] Ollama loaded gpt-oss:120b in NN s` (once per model)

---

## Step 9: Web address and HTTPS

1. Point your domain's DNS **A record** to the Spark's public IP, or set up a Cloudflare Tunnel to `https://localhost:443`.
2. Install the site configuration:
   ```bash
   sudo cp /opt/mpod/deploy/dgx-spark/nginx/mpod.conf /etc/nginx/sites-available/mpod
   sudo sed -i 's/mpod.example.edu/<your-domain>/g' /etc/nginx/sites-available/mpod
   sudo ln -s /etc/nginx/sites-available/mpod /etc/nginx/sites-enabled/mpod
   sudo rm -f /etc/nginx/sites-enabled/default
   ```
3. Get the certificate. The HTTPS block can't load until the certificate exists, so get it first with nginx stopped:
   ```bash
   sudo systemctl stop nginx
   sudo certbot certonly --standalone -d <your-domain>
   sudo nginx -t && sudo systemctl start nginx
   ```
   Renewal then runs automatically. Add `--pre-hook "systemctl stop nginx" --post-hook "systemctl start nginx"` to the certbot renew timer, or switch to `--webroot -w /var/www/certbot`.
4. Open the firewall for the web only. MongoDB, Ollama and the API listen on 127.0.0.1 and are never reachable from outside.
   ```bash
   sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
   ```

---

## Step 10: Verify before going live

```bash
cd /opt/mpod/backend
sudo -u mpod NODE_ENV=production npm run ai:check
sudo -u mpod NODE_ENV=production npm run ai:calibrate -- --providers=openai,ollama --runs=3
curl -s https://<your-domain>/backend/api/health
```

| Check | Expected |
|---|---|
| `ai:check` | ✔ on the health check and all 5 tasks for each provider. The first run after a restart is slower while models load. |
| `ai:calibrate` | Ollama is in band about as often as OpenAI, and the average difference is under about 10 points. If not, see "Tuning". |
| Admin portal at `https://<domain>/admin/` | Log in. No yellow AI banner. |
| End-to-end test | Schedule a technology, a company and a coding interview for a test student. Take them on the website and on a registered kiosk. The reports show scores, not "Provisional". |
| Backup test | `sudo systemctl stop ollama`, take an interview: it is scored by OpenAI, and the admin banner (platform admins) says "using OpenAI as backup". Then `sudo systemctl start ollama`: within about a minute the banner disappears. |

---

## Step 11: Operations

**Backups (only if the database is on the Spark):**

```bash
sudo mkdir -p /etc/mpod
echo 'MONGO_BACKUP_URI="mongodb://mpod_backup:<password>@127.0.0.1:27017/?authSource=admin&replicaSet=rs0"' | sudo tee /etc/mpod/backup.env
sudo chmod 600 /etc/mpod/backup.env
sudo /opt/mpod/deploy/dgx-spark/scripts/backup-mongo.sh        # test once
sudo crontab -e   # add: 30 2 * * * /opt/mpod/deploy/dgx-spark/scripts/backup-mongo.sh >> /var/log/mpod-backup.log 2>&1
```

Copy `/var/backups/mpod` to another machine or cloud storage regularly. Practise a restore once with `mongorestore --gzip --archive=<file> --drop`.

**Everyday commands:**

| Task | Command |
|---|---|
| API logs | `journalctl -u mpod-backend -f` |
| Restart the API | `sudo systemctl restart mpod-backend` |
| GPU and model status | `nvidia-smi`, `ollama ps` |
| Deploy a new version | `RESTART=1 /opt/mpod/deploy/dgx-spark/scripts/deploy.sh` (needs sudo rights for the restart) |
| Roll back | `git checkout <previous-tag>` in `/opt/mpod`, then deploy again |
| Switch AI provider | Edit `AI_PROVIDER` / `AI_FALLBACK_PROVIDER` in `backend/.env`, then restart the API |
| Change a model | `ollama pull <model>`, set `OLLAMA_*_MODEL`, restart the API, run `npm run ai:check` |

Restarts are safe even while interviews are being scored: the evaluation queue resumes unfinished work automatically. Still, deploy outside exam hours.

---

## Tuning and capacity

**Memory:** the DGX Spark has 128 GB of unified memory. The 3 recommended models use about 100 GB, leaving room for the OS, MongoDB and Node.

**Throughput:** each technology interview of 10 questions needs about 11 AI calls (10 scores + 1 summary). With 4 parallel requests, a few dozen interviews per hour is comfortable. Measure your own rate: `evaluation_ai.duration_ms` is stored on every evaluated interview.

| Symptom | Change |
|---|---|
| Scores arrive slowly, GPU not fully busy | Raise `OLLAMA_NUM_PARALLEL` (server) and `OLLAMA_MAX_CONCURRENCY` (backend) together, e.g. to 6 |
| "Ollama did not answer within ..." in logs | Lower `EVALUATION_CONCURRENCY` to 2, or raise `OLLAMA_TIMEOUT_MS` |
| Question generation slow for students | It already gets priority. Use a smaller generation model, e.g. `qwen3:30b-a3b`. |
| Scores differ too much from OpenAI | Keep `gpt-oss:120b` for scoring. Try `OLLAMA_THINK=medium` (slower, more careful). |
| "ran out of output tokens" errors | Raise `OLLAMA_REASONING_TOKENS` to 4096, or set `OLLAMA_THINK=low` |
| Out of memory loading models | Use `gpt-oss:20b` for scoring, or `OLLAMA_MAX_LOADED_MODELS=2` |
| Hundreds of interviews per hour | Serve the models with vLLM or TensorRT-LLM instead of Ollama. Point `OPENAI_BASE_URL` at it and set `AI_PROVIDER=openai`; no code changes needed. |

---

## Troubleshooting

| Admin banner / log message | Fix |
|---|---|
| `Cannot reach Ollama at http://127.0.0.1:11434` | `sudo systemctl status ollama`, then `sudo systemctl start ollama` |
| `Ollama model "x" is not installed` | `ollama pull x` (the banner shows the exact command) |
| `OpenAI rejected the API key (401)` | Only matters while OpenAI is used. Fix the key's `model.request` permission, or set `AI_FALLBACK_PROVIDER=none`. |
| Website loads but camera/microphone don't work | The page must be HTTPS with a valid certificate. Check `Permissions-Policy` in the nginx config. |
| Login works locally but not through the domain | Make sure `CORS_ORIGINS` is exactly `https://<your-domain>` and `COOKIE_SECURE=true` |
| `Port 8002 is already in use` | Another backend is running: `sudo systemctl stop mpod-backend`, then check `lsof -i :8002` |

---

## Known limits

- **Speech recognition isn't local.** It uses Chrome's built-in service, which sends audio to Google, so students and kiosks need internet. A local Whisper model on the Spark could replace this later (it would need a front-end change).
- **Single machine.** The Spark is a single point of failure. Keep the OpenAI fallback and off-machine backups. The API must run as **one** process.
- **Self-hosted scores can differ from OpenAI's.** Re-run `ai:calibrate` whenever you change a model.
