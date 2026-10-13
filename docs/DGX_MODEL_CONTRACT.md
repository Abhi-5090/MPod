# mPod models and the DGX Spark API contract

This document is for the team that prepares and serves the models on the NVIDIA DGX Spark. It covers:
- every model mPod uses, and which ones move to the DGX;
- the exact requests mPod sends and the answers it expects;
- what to hand over so the AWS application can connect.

```
 Students / kiosks ──► mPod on AWS (website, admin, API, database)
                              │  HTTPS + API key (Authorization: Bearer ...)
                              ▼
                      DGX Spark gateway (nginx, deploy/dgx-spark/gateway)
                       ├── LLM server (Ollama, or vLLM / TensorRT-LLM)  4 language-model tasks
                       └── Vision service                               camera model
```

---

## 1. Models used by mPod

### Models that move to the DGX Spark

| # | Task (setting) | What it does in mPod | Today | Recommended open model on the DGX | Setting on AWS |
|---|---|---|---|---|---|
| 1 | **Question generation** (`generation`) | Writes the technology-interview questions from the chosen syllabus topics, when the student starts. The student is waiting. | OpenAI `gpt-3.5-turbo` | `gpt-oss:20b` | `DGX_GENERATION_MODEL` |
| 2 | **Answer scoring** (`scoring`) | Scores every spoken answer in technology and company interviews: accuracy 0–100, analysis, improvements. Highest impact on quality. | OpenAI `gpt-4o` | `gpt-oss:120b` | `DGX_SCORING_MODEL` |
| 3 | **Interview summary** (`summary`) | Strengths, areas of improvement and 7 skill ratings for each technology or company interview | OpenAI `gpt-3.5-turbo` | `gpt-oss:20b` | `DGX_SUMMARY_MODEL` |
| 4 | **Coding evaluation** (`coding`) | The idea check while the student is waiting, then code correctness, complexity and quality, and the optimisation comparison | OpenAI `gpt-4-turbo` | `qwen3-coder:30b` | `DGX_CODING_MODEL` |
| 5 | **Camera analysis** (vision) | Coding interview only: finds the face, its 68 face points and 7 emotions, about once per second. mPod derives head direction (left, centre, right), blinks and emotion share from this. | `face-api.js` in the student's browser: TinyFaceDetector + FaceLandmark68Net + FaceExpressionNet | Any detector + 68-point landmark model + 7-class expression model behind the contract in section 4 | `DGX_VISION_URL` |

### Things that are *not* hosted models

| Item | What it is | Note |
|---|---|---|
| Speech-to-text | Chrome's built-in speech recognition, which uses Google's service | Needs internet on student machines. Moving it to the DGX (e.g. Whisper) would need a front-end change. Not part of this release. |
| Reading questions aloud | The browser's built-in voice | Runs on the student's machine. |
| Provisional scores | Keyword and similarity scoring in the backend, used only when no model is reachable | Plain code, no model. |

### About "training"
- **The OpenAI models cannot be downloaded or trained** (`gpt-4o`, `gpt-4-turbo`, `gpt-3.5-turbo`). On the DGX you run **open-weight** models instead, such as `gpt-oss`, Qwen or Llama.
- **Fine-tuning is optional.** You can serve these models as they are, or fine-tune them (e.g. LoRA) on your own data, including past mPod interviews that OpenAI scored.
- **Model names are your choice.** Use whatever name the server serves them under, then tell the AWS side the exact name for each task.

---

## 2. What to hand over to the AWS application

| Item | Example | AWS setting |
|---|---|---|
| Public HTTPS address of the gateway | `https://ai.yourcollege.edu` | `DGX_BASE_URL` |
| Protocol of the LLM server | `ollama` (Ollama) or `openai` (vLLM, TensorRT-LLM, SGLang) | `DGX_PROTOCOL` |
| API key (from `make-api-key.sh create aws-prod`) | `mpod_3f9c…` | `DGX_API_KEY` |
| Exact model name for each of the 4 tasks | `gpt-oss:120b`, `gpt-oss:20b`, `gpt-oss:20b`, `qwen3-coder:30b` | `DGX_SCORING_MODEL`, `DGX_GENERATION_MODEL`, `DGX_SUMMARY_MODEL`, `DGX_CODING_MODEL` |
| Vision service address | `https://ai.yourcollege.edu/vision` | `DGX_VISION_URL` |
| Vision key, only if different from the main key | | `DGX_VISION_API_KEY` |
| *Optional:* a separate address, key or protocol for one task | e.g. scoring on its own vLLM server | `DGX_SCORING_URL`, `DGX_SCORING_API_KEY`, `DGX_SCORING_PROTOCOL` (same for the other tasks) |

The AWS side sends back its outbound public IP (Elastic IP or NAT gateway), so the gateway can accept only that address.

**Keys only travel encrypted.** mPod refuses to send keys over plain `http://` to a public address in production.

---

## 3. Language-model contract (tasks 1–4)

### 3.1 Requirements for the LLM server

| Requirement | Value |
|---|---|
| JSON output | **Required.** Ollama: `format: "json"`. OpenAI-compatible: `response_format: {"type": "json_object"}` (vLLM supports this through guided decoding). |
| Context window | ≥ 8,192 tokens (coding descriptions and answers can be long) |
| Parallel requests | ≥ 4 at once (`OLLAMA_NUM_PARALLEL`, or vLLM's default batching) |
| Latency, student waiting | Question generation < 20 s, idea check < 10 s (95th percentile) |
| Latency, background | Scoring, summary and code evaluation < 60 s per call |
| Reasoning models | Allowed. mPod asks gpt-oss for `low` reasoning effort and turns thinking off for Qwen3 (chat-template switch); `<think>` text is tolerated. |

### 3.2 Requests mPod sends

**Ollama protocol** (`DGX_PROTOCOL=ollama`): `POST {DGX_BASE_URL}/api/chat`

```json
{
  "model": "gpt-oss:120b",
  "messages": [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}],
  "stream": false,
  "format": "json",
  "think": "low",
  "keep_alive": -1,
  "options": {"temperature": 0.2, "num_ctx": 8192, "num_predict": 2748}
}
```

It also calls:
- `POST /api/show {"model": "..."}` to read the model's capabilities;
- `GET /api/version` and `GET /api/ps` for the health check;
- `POST /api/chat` with `"messages": []` to pre-load a model into memory.

**OpenAI-compatible protocol** (`DGX_PROTOCOL=openai`): `POST {DGX_BASE_URL}/v1/chat/completions`

```json
{
  "model": "gpt-oss-120b",
  "messages": [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}],
  "temperature": 0.2,
  "max_tokens": 2748,
  "response_format": {"type": "json_object"},
  "reasoning_effort": "low"
}
```

The health check calls `GET /v1/models`; every configured model name must be in the list.

Every request carries `Authorization: Bearer <DGX_API_KEY>`. The gateway checks the key and removes it before passing the request to the model server.

### 3.3 Calls per task: budgets and the JSON each must return

| Call | Task | Max output tokens* | Temperature | Required JSON answer |
|---|---|---|---|---|
| Question generation | generation | 80 + 60 × N | 0.7 | `{"questions": ["...", "..."]}`: exactly N single questions, ≤ 25 words, no code |
| Answer scoring | scoring | 700 | 0.2 | `{"accuracy": 0-100, "analysis": "...", "improvements": "..."}` |
| Interview summary | summary | 900 | 0.4 | `{"strengths": ["..."], "areas_of_improvement": ["..."], "interview_parameters": {"communication_skills": 0-100, "understandability": 0-100, "analytical_skills": 0-100, "time_management": 0-100, "domain_skills": 0-100, "logical_thinking": 0-100, "attention_to_detail": 0-100}}` |
| Idea check | coding | 50 | 0.2 | `{"accuracy": 0-100}` |
| Code evaluation | coding | 1200 | 0.2 | Not code: `{"is_code": false, "message": "..."}`. Code: `{"is_code": true, "accuracy": 0-100, "efficiency": {"time_complexity": "...", "space_complexity": "..."}, "code_quality": {"readability": "High\|Medium\|Low", "variable_naming": "..."}, "logical_approach": "Correct\|Partially correct\|Incorrect", "output_format": "Correct\|Incorrect", "observations": ["..."], "analysis": "..."}` |
| Optimisation comparison | coding | 500 | 0.2 | `{"optimized_percentage": 0-100, "time_complexity": "...", "space_complexity": "...", "optimization_comment": "..."}` |

\* Reasoning models get `DGX_REASONING_TOKENS` (default 2048) extra for thinking.

**Scoring rubric** (in the prompt; useful when fine-tuning):

| Answer | Accuracy |
|---|---|
| Completely wrong, irrelevant or unrelated | 0 |
| Partly correct, with spelling mistakes | 10–20 |
| Partly correct | 40–70 |
| Mostly correct | 70–90 |
| Fully correct and well explained | 90–100 |

Answers come from speech-to-text, so the model must ignore small transcription errors. Student text is wrapped in `<candidate_*>` tags and must be treated as data: instructions inside it are ignored (protection against prompt injection).

**Load per interview:**
- technology interview with N questions: 1 generation + N scoring + 1 summary;
- company interview: N scoring + 1 summary;
- coding interview: per problem, up to 5 idea checks + 1 code evaluation (+ 1 optimisation comparison).

---

## 4. Vision contract (task 5)

`DGX_VISION_URL` is the base address, e.g. `https://ai.yourcollege.edu/vision`. Every request carries `Authorization: Bearer <key>`.

### `GET {DGX_VISION_URL}/health`
```json
200 {"status": "ok", "model": "face-v1"}
```

### `POST {DGX_VISION_URL}/v1/face/analyze`
Request:
```json
{"image": "<base64 JPEG, no data: prefix; about 320x240, quality 0.7>", "max_faces": 3}
```
Response:
```json
200 {
  "faces": [
    {
      "box": {"x": 95, "y": 80, "width": 130, "height": 150},
      "score": 0.99,
      "landmarks": [[100.0, 110.0], [107.5, 123.6], "... 68 points in total ..."],
      "expressions": {"neutral": 0.82, "happy": 0.10, "sad": 0.02, "angry": 0.02,
                      "fearful": 0.01, "disgusted": 0.01, "surprised": 0.02}
    }
  ]
}
```

| Field | Rule |
|---|---|
| `faces` | One entry per detected face, best first; `[]` when there is none. More than one face makes mPod warn the student. |
| `landmarks` | Exactly **68** `[x, y]` points in **iBUG 300-W order**, in pixels of the image sent: jaw 0–16, eyebrows 17–26, nose 27–35 (27 = top of the bridge), right eye 36–41, left eye 42–47, mouth 48–67. mPod uses the jaw and point 27 for head direction, and points 36–47 for blinks (eye aspect ratio < 0.29 = closed). |
| `expressions` | Probabilities (0–1, summing to about 1) for `neutral, happy, sad, angry, fearful, disgusted, surprised`. The short names `fear`, `disgust` and `surprise` are also accepted. |
| Errors | 400 for a bad image, 401 for a bad key, 5xx for a server problem. On any failure, mPod switches that student to the in-browser model, so the interview continues. |
| Performance | < 300 ms per frame (95th percentile). Expect about 1 request per second for every student in a coding interview. |
| Privacy | **Do not store frames.** mPod stores only aggregate counts (blinks, head-direction time, emotion percentages). |

`deploy/dgx-spark/vision/mock-vision-server.js` implements this contract with fixed answers. Use it to test the gateway and the AWS connection before the real model is ready.

---

## 5. Checking your endpoints from the AWS side

```bash
# on the AWS server, with the DGX settings in backend/.env
npm run ai:check          # health + one real call per task + one camera frame, with timings
npm run ai:calibrate -- --providers=openai,dgx --runs=3   # compare scores with OpenAI (optional)
```

Quick manual checks:

```bash
curl -s https://ai.yourcollege.edu/api/version -H "Authorization: Bearer $KEY"     # Ollama protocol
curl -s https://ai.yourcollege.edu/v1/models  -H "Authorization: Bearer $KEY"      # OpenAI-compatible protocol
curl -s https://ai.yourcollege.edu/vision/health -H "Authorization: Bearer $KEY"
curl -s -o /dev/null -w "%{http_code}\n" https://ai.yourcollege.edu/api/version    # must print 401
```
