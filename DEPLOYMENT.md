# Deploying mPod: application on AWS, models on the DGX Spark

```
 Students, kiosks, staff
          │ HTTPS
          ▼
┌───────────────────────────── AWS ──────────────────────────────┐
│ nginx ─► website, admin portal, API (Node) ─► MongoDB           │
│                         │ (Atlas or self-managed)               │
└─────────────────────────┼───────────────────────────────────────┘
                          │ HTTPS + API key  (DGX_BASE_URL, DGX_API_KEY)
┌─────────────────────────▼──────── DGX Spark ───────────────────┐
│ AI gateway (nginx): key check, allow-list, rate limits          │
│   ├─► LLM server on 127.0.0.1 (Ollama :11434 or vLLM :8000)     │
│   │     scoring · question generation · summary · coding        │
│   └─► Vision service on 127.0.0.1:8100 (camera model)           │
└─────────────────────────────────────────────────────────────────┘
```

- **AWS** runs the application and database. It never runs a model.
- **The DGX Spark** runs every model. It is reachable only through the gateway, only with a key, and ideally only from the AWS IP.
- **The models and the exact API contract** are in [docs/DGX_MODEL_CONTRACT.md](docs/DGX_MODEL_CONTRACT.md).
- **If the DGX Spark is unreachable, interviews still run:** questions come from the question bank, answers get provisional scores (re-scored automatically later), and the camera model runs in the browser. Optionally, OpenAI can serve as backup.

**Order of work:**
1. Part A on the DGX Spark: models, vision service, gateway, keys.
2. Send the AWS side the address, key and model names (section A6).
3. Part B on AWS.
4. Run the checks in Part C.

---

# Part A: DGX Spark (AI server)

Commands run on the Spark (DGX OS = Ubuntu 24.04, ARM64).

## A1. Domain name and certificate

The gateway needs HTTPS. Give the Spark's public IP a name, e.g. an **A record** `ai.yourcollege.edu → <public IP>`, and open ports 80 and 443 to it (router or firewall port forwarding).

- **No domain possible?** Use a self-signed certificate. Then copy its CA file to the AWS server and set `NODE_EXTRA_CA_CERTS` in the backend's systemd unit (`Environment=NODE_EXTRA_CA_CERTS=/opt/mpod/dgx-gateway-ca.pem`).
- **Never use plain HTTP over the internet:** keys and student answers would travel unencrypted. mPod refuses it in production unless `DGX_ALLOW_INSECURE=true`.

```bash
sudo apt update && sudo apt -y install nginx certbot git ufw
sudo systemctl stop nginx
sudo certbot certonly --standalone -d ai.yourcollege.edu
sudo systemctl start nginx
```

## A2. Language models

**Option 1: Ollama** (already installed; simplest). Set `DGX_PROTOCOL=ollama` on AWS.

```bash
sudo mkdir -p /etc/systemd/system/ollama.service.d
sudo cp deploy/dgx-spark/ollama/override.conf /etc/systemd/system/ollama.service.d/override.conf
sudo systemctl daemon-reload && sudo systemctl restart ollama

ollama pull gpt-oss:120b      # scoring
ollama pull gpt-oss:20b       # question generation + summary
ollama pull qwen3-coder:30b   # coding evaluation
```

The override keeps Ollama on `127.0.0.1` and allows 4 parallel requests, with all 3 models kept loaded. For fine-tuned models, import them into Ollama (`ollama create <name> -f Modelfile`) and give their names to the AWS side.

**Option 2: vLLM / TensorRT-LLM** (higher throughput). Set `DGX_PROTOCOL=openai` on AWS.

Serve each model with an OpenAI-compatible API on `127.0.0.1:8000`, for example with NVIDIA's vLLM container for DGX Spark, with these settings:
- `--served-model-name` set to the names you will hand over;
- `--host 127.0.0.1`.

Several models on different ports need one gateway location each, plus per-task URLs on AWS (`DGX_SCORING_URL`, …).

Whichever option you use, the server must support **JSON output** (`response_format: json_object`) and an **8k context window**. See the contract, section 3.1.

## A3. Vision service (camera model)

Run your trained camera model as an HTTP service on **127.0.0.1:8100**, following the contract in section 4:
- `GET /health`
- `POST /v1/face/analyze` → faces with 68 landmarks and 7 expressions

Run it as a systemd service so it restarts automatically.

**Until your model is ready,** test everything with the mock:

```bash
node deploy/dgx-spark/vision/mock-vision-server.js      # 127.0.0.1:8100, fixed answers
```

## A4. Gateway

```bash
sudo cp deploy/dgx-spark/gateway/mpod-ai-gateway.conf /etc/nginx/sites-available/mpod-ai-gateway
sudo sed -i 's/ai.example.edu/ai.yourcollege.edu/g' /etc/nginx/sites-available/mpod-ai-gateway
sudo touch /etc/nginx/mpod-ai-keys.conf && sudo chown root:www-data /etc/nginx/mpod-ai-keys.conf && sudo chmod 640 /etc/nginx/mpod-ai-keys.conf
sudo ln -s /etc/nginx/sites-available/mpod-ai-gateway /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

What the gateway does:
- accepts only requests with a valid key (otherwise 401);
- removes the key before passing the request to the model servers;
- forwards only the endpoints mPod needs: chat, model info, health, vision;
- blocks model download, delete and admin calls (404);
- limits the request rate per key;
- logs the client name but never the key.

**Restrict it to AWS** once you know the AWS outbound IP: uncomment `allow <aws-ip>; deny all;` in the file, then reload nginx.

## A5. API keys

```bash
sudo deploy/dgx-spark/gateway/make-api-key.sh create aws-prod     # prints the key once
sudo deploy/dgx-spark/gateway/make-api-key.sh list
sudo deploy/dgx-spark/gateway/make-api-key.sh revoke aws-prod     # stops working immediately
```

Use one key per environment, e.g. `aws-prod` and `aws-staging`. To rotate a key:
1. create a new one, e.g. `aws-prod-2`;
2. put it on AWS and restart the backend;
3. revoke the old one.

## A6. Hand over to the AWS side

Send these over a secure channel (not plain email):

| Item | Example |
|---|---|
| `DGX_BASE_URL` | `https://ai.yourcollege.edu` |
| `DGX_PROTOCOL` | `ollama` or `openai` |
| `DGX_API_KEY` | from `make-api-key.sh create aws-prod` |
| `DGX_SCORING_MODEL`, `DGX_GENERATION_MODEL`, `DGX_SUMMARY_MODEL`, `DGX_CODING_MODEL` | exact served names |
| `DGX_VISION_URL` | `https://ai.yourcollege.edu/vision` |

**Firewall on the Spark:** allow only SSH and the gateway. Ollama, vLLM and the vision service listen on 127.0.0.1 only.

```bash
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
```

---

# Part B: Application on AWS

The steps are for an EC2 instance with Ubuntu 24.04. Other AWS setups (ECS, Elastic Beanstalk) use the same settings and files.

| AWS piece | Recommendation |
|---|---|
| Compute | One EC2 instance, e.g. `t3.large` (the app does no AI work, so it needs little CPU). **Run one backend process only:** the evaluation queue and rate limits live in it. |
| Public IP | An **Elastic IP**. This is the address the DGX gateway allows. |
| Database | **MongoDB Atlas** (replica set by default), or your current database, or self-managed on EC2 (`deploy/aws/mongodb/mongod.conf`) |
| HTTPS | nginx with Let's Encrypt on the instance (`deploy/aws/nginx/mpod.conf`), or an Application Load Balancer with an ACM certificate |
| Secrets | `backend/.env` (chmod 600), or AWS Secrets Manager / SSM exported as environment variables |
| Security group | Inbound 80/443 from anywhere, 22 from your IP only. Outbound 443 (to the DGX gateway, Gmail SMTP 465/587, npm). |
| Backups | Atlas backups, or `deploy/aws/scripts/backup-mongo.sh` + S3 |

## B1. Server and code

```bash
sudo apt update && sudo apt -y install git nginx certbot curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt -y install nodejs
sudo useradd --system --create-home --home-dir /opt/mpod --shell /bin/bash mpod
sudo -u mpod git clone <your-private-repo-url> /opt/mpod/app && sudo -u mpod bash -c 'shopt -s dotglob; mv /opt/mpod/app/* /opt/mpod/ && rmdir /opt/mpod/app'
```

The repository has no remote yet: push it to a private GitHub/GitLab repo first, or copy it with `rsync`, excluding `node_modules`, `.env*` and `_pii_quarantine`.

## B2. Settings

```bash
sudo -u mpod cp /opt/mpod/deploy/aws/backend.env.example /opt/mpod/backend/.env
sudo -u mpod chmod 600 /opt/mpod/backend/.env
sudo -u mpod nano /opt/mpod/backend/.env
```

Fill in:
- the database;
- `JWT_SECRET` (new, 32+ characters; changing it logs everyone out once);
- the domain;
- email;
- the **DGX values from A6**.

## B3. Data (if moving from the current server)

**Database:**
- Atlas: use Atlas Live Migration.
- Otherwise:
  ```bash
  mongodump --uri="<current URI>" --gzip --archive=mpod.archive.gz
  mongorestore --uri="<new URI>" --gzip --archive=mpod.archive.gz
  ```

**Uploaded files:** copy them from the current server:
- `backend/src/uploads/profile-pics/`
- `backend/uploads/`

**Then run the one-time migration** (credit ledger opening balances, indexes). Run it once without `--apply` to preview the changes:

```bash
cd /opt/mpod/backend && sudo -u mpod NODE_ENV=production node scripts/migrate.js            # preview
sudo -u mpod NODE_ENV=production node scripts/migrate.js --apply
```

## B4. Build, start, HTTPS

```bash
sudo -u mpod /opt/mpod/deploy/aws/scripts/deploy.sh
sudo cp /opt/mpod/deploy/aws/systemd/mpod-backend.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now mpod-backend

sudo cp /opt/mpod/deploy/aws/nginx/mpod.conf /etc/nginx/sites-available/mpod
sudo sed -i 's/mpod.example.edu/<your-domain>/g' /etc/nginx/sites-available/mpod
sudo ln -s /etc/nginx/sites-available/mpod /etc/nginx/sites-enabled/ && sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl stop nginx && sudo certbot certonly --standalone -d <your-domain> && sudo nginx -t && sudo systemctl start nginx
```

The startup log (`journalctl -u mpod-backend -f`) should show:

```
[ai] provider: DGX Spark (https://ai.yourcollege.edu (ollama); scoring=gpt-oss:120b, ...)
[ai] camera analysis: DGX vision service (https://ai.yourcollege.edu/vision)
```

---

# Part C: Checks before going live

Run on AWS:

```bash
cd /opt/mpod/backend
sudo -u mpod NODE_ENV=production npm run ai:check
```

This checks:
- the DGX health check passes;
- each endpoint answers;
- all 5 language-model calls work, with their timings;
- the camera service works.

| Check | Expected |
|---|---|
| `ai:check` | All ✔. Question generation under about 20 s. |
| Scoring quality (optional, needs an OpenAI key) | `npm run ai:calibrate -- --providers=openai,dgx --runs=3`: the DGX is in band about as often as OpenAI, with an average difference under about 10 points |
| Key enforcement | `curl -s -o /dev/null -w "%{http_code}" https://ai.yourcollege.edu/api/version` prints `401` |
| Admin portal | No AI banner |
| End-to-end | Schedule technology, company and coding interviews for a test student; take them on the website and a kiosk. Reports show scores, not "Provisional". In the coding interview, the camera works. |
| Outage drill | Stop Ollama and the vision service on the Spark: new interviews still run (bank questions, provisional scores, browser camera model), and the admin banner explains why. Start it again: within about a minute everything is back, and provisional scores are replaced automatically. |

---

## Operations

| Task | Where | Command |
|---|---|---|
| API logs | AWS | `journalctl -u mpod-backend -f` |
| Gateway access log (client names, no keys) | DGX | `sudo tail -f /var/log/nginx/mpod-ai.access.log` |
| GPU and model status | DGX | `nvidia-smi`, `ollama ps` |
| Deploy a new version | AWS | `RESTART=1 /opt/mpod/deploy/aws/scripts/deploy.sh` |
| Change a model | DGX, then AWS | Serve the new model, update `DGX_*_MODEL` on AWS, restart the backend, run `npm run ai:check` |
| Rotate a key | both | Section A5 |

**Tuning:**

| Symptom | Change |
|---|---|
| Scores arrive slowly, GPU not busy | Raise `OLLAMA_NUM_PARALLEL` (DGX) and `DGX_MAX_CONCURRENCY` (AWS) together |
| "did not answer within" errors | Lower `EVALUATION_CONCURRENCY` on AWS, or raise `DGX_TIMEOUT_MS` |
| "ran out of output tokens" | Raise `DGX_REASONING_TOKENS`, or set `DGX_THINK=low` |
| Camera frames slow | Make the vision model faster (< 300 ms), or raise `DGX_VISION_INTERVAL_MS` to 1500 |

**Troubleshooting (admin banner / `ai:check` messages):**

| Message | Fix |
|---|---|
| `Cannot reach DGX Spark at https://…` | Is the Spark on? DNS and port forwarding OK? `sudo systemctl status nginx ollama` on the Spark |
| `TLS certificate not trusted` | Use a public certificate, or set `NODE_EXTRA_CA_CERTS` on AWS |
| `DGX Spark rejected the API key (401)` | `DGX_API_KEY` on AWS must match a key from `make-api-key.sh list`. Check the gateway's `allow` list includes the AWS IP. |
| `DGX Spark model "x" is not installed / not available` | Serve the model under exactly that name (`ollama pull x`, or vLLM `--served-model-name x`) |
| `Camera analysis service unavailable` | Check the vision service on 127.0.0.1:8100 (`curl 127.0.0.1:8100/health` on the Spark). Students fall back to the browser model meanwhile. |

**Known limits:**
- **Speech-to-text** still uses Chrome's built-in service (Google), so student machines need internet.
- **The DGX Spark is a single machine.** Keep the fallbacks enabled. Optionally set `AI_FALLBACK_PROVIDER=openai` for critical exam days.
