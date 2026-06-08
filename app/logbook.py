"""Local session logging for validation."""
import json, time, threading, queue
from pathlib import Path
from datetime import datetime

class SessionLog:
    def __init__(self, base_dir):
        self.dir = Path(base_dir) / "sessions"
        self.dir.mkdir(parents=True, exist_ok=True)
        stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        self.file = self.dir / f"session-{stamp}.jsonl"
        self.log_queue = queue.Queue()
        self.writer_thread = threading.Thread(target=self._writer, daemon=True)
        self.writer_thread.start()

    def _writer(self):
        while True:
            record = self.log_queue.get()
            if record is None:
                break
            try:
                with open(self.file, "a", encoding="utf-8") as f:
                    f.write(json.dumps(record, default=str) + "\n")
            except Exception: pass
            self.log_queue.task_done()

    def _append(self, record):
        record.update({"ts":time.time(),"ts_human":datetime.now().isoformat(timespec="seconds")})
        self.log_queue.put_nowait(record)

    def log_query(self, db_id, question, result):
        import uuid
        qid = uuid.uuid4().hex[:12]
        self._append({"event":"query","query_id":qid,"db_id":db_id,"question":question,
            "sql":result.get("sql"),"confidence":result.get("confidence"),
            "confidence_reason":result.get("confidence_reason"),
            "based_on_verified":result.get("based_on_verified"),
            "row_count":len(result.get("rows",[]) or []),
            "execution_error":result.get("execution_error")})
        return qid

    def log_feedback(self, query_id, verdict, reason=""):
        self._append({"event":"feedback","query_id":query_id,"verdict":verdict,"reason":reason})
