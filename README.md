# BoloDB

**Ask your data. Trust the answer.**

A text-to-SQL product for non-technical users. Connect any SQL database, ask questions in plain English, get answers with a plain-English explanation and a confidence level. Every answer you confirm teaches it your database - accuracy improves with use.

## Quick start (Windows)

1. Double-click **setup.bat** - installs Python packages and your DB driver (30 seconds)
2. Double-click **run.bat** - server starts and browser opens
3. Pick your AI engine, connect a database (or click "Try with sample data")
4. Start asking

## Quick start (Mac / Linux)

```bash
pip install -r requirements.txt
python main.py
```

Then open http://localhost:4321

## Choose your AI engine

| Engine | Privacy | Cost | Setup |
|---|---|---|---|
| Local (Ollama) | Fully private, nothing leaves your machine | Free | Install Ollama + `ollama pull llama3.2` |
| Claude API | Schema + question sent to Anthropic | Pay per use | Paste API key in Settings |
| OpenAI API | Schema + question sent to OpenAI | Pay per use | Paste API key in Settings |
| Groq API | Schema + question sent to Groq | Pay per use | Paste API key in Settings |

With any API engine, only the schema and your question are sent - never your actual row data.

### Local AI setup

1. Install Ollama: https://ollama.ai
2. Pull a model: `ollama pull llama3.2` (4GB RAM) or `ollama pull qwen2.5:0.5b` (low RAM)
3. BoloDB auto-starts Ollama when you launch

## Database connection strings

| Database | Format |
|---|---|
| SQLite | `sqlite:///C:/path/to/file.db` |
| PostgreSQL | `postgresql://user:pass@host:5432/dbname` |
| MySQL | `mysql+pymysql://user:pass@host:3306/dbname` |
| SQL Server | `mssql+pyodbc://user:pass@server/db?driver=ODBC+Driver+17+for+SQL+Server` |

Tip: connect with a **read-only database account** for safety.

## How it works

1. **Connect** a database and pick an AI engine
2. **Onboard** (first time) - BoloDB profiles the tables, confirms business-term meanings with you, and runs a few starter questions for you to verify
3. **Ask** questions in plain English. Every answer includes:
   - A plain-English restatement ("I summed completed orders for this month")
   - A confidence level (High/Medium/Low) based on real signals
   - The results table and SQL on a toggle
4. **Verify** - click "Yes, correct" to save the answer. Similar future questions reuse it and show higher confidence. The trust level climbs from Supervised to Assisted to Trusted

## Command-line options

```
python main.py                          # start, configure in UI
python main.py --db sqlite:///shop.db   # pre-connect a database
python main.py --port 8080              # different port
python main.py --no-browser             # don't auto-open browser
```

## Running tests

```bash
pip install -r requirements.txt
pytest
```

## Privacy

- All learned knowledge is stored locally in `~/.bolodb/`
- With a local model (Ollama), nothing leaves your machine
- With an API model, only the schema and your question are sent to generate SQL
- No telemetry, no cloud sync
- Delete `~/.bolodb/` to wipe everything BoloDB has learned

## License

MIT &mdash; see [LICENSE](LICENSE).
