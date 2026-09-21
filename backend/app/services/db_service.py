"""Database Persistence Service exclusively utilizing MySQL Relational Database.
Provides ACID compliant storage for Officers, Inspections, and Audit Logs.
Supports strict data isolation per Officer ID.
"""
import os
import json
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Ensure .env is loaded from backend/ or project root regardless of CWD
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(os.path.dirname(CURRENT_DIR))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)

for _env_candidate in [os.path.join(BACKEND_DIR, ".env"), os.path.join(PROJECT_ROOT, ".env")]:
    if os.path.exists(_env_candidate):
        load_dotenv(_env_candidate, override=False)
load_dotenv()

DATA_DIR = os.path.join(BACKEND_DIR, "app", "data")
DB_FILE = os.path.join(DATA_DIR, "legal_metrology.db")
OLD_INSPECTIONS_FILE = os.path.join(DATA_DIR, "inspections_store.json")
OLD_OFFICERS_FILE = os.path.join(DATA_DIR, "officers.json")


class DatabaseService:
    """Dedicated Database Service configured for MySQL Relational Database."""

    def __init__(self):
        self.engine_type = "mysql"
        self.mysql_config = {}
        self.sqlite_path = DB_FILE

        self._check_engine_preference()
        self._init_database()
        self._migrate_from_json_if_needed()

    def _check_engine_preference(self):
        """Configure and establish MySQL database connection."""
        allow_sqlite = os.getenv("ALLOW_SQLITE_FALLBACK", "").strip().lower() in ["true", "1", "yes"]
        use_mysql = os.getenv("USE_MYSQL", "true").strip().lower() in ["true", "1", "yes"]
        mysql_host = os.getenv("MYSQL_HOST", "localhost")
        mysql_port = int(os.getenv("MYSQL_PORT", "3306"))
        mysql_user = os.getenv("MYSQL_USER", "root")
        mysql_pass = os.getenv("MYSQL_PASSWORD", "")
        mysql_db = os.getenv("MYSQL_DATABASE", "legal_metrology")
        db_url = os.getenv("DATABASE_URL", "")

        # If DATABASE_URL is provided like mysql://user:pass@host:port/dbname
        if db_url.startswith("mysql"):
            from urllib.parse import urlparse
            parsed = urlparse(db_url)
            mysql_host = parsed.hostname or mysql_host
            mysql_port = parsed.port or mysql_port
            mysql_user = parsed.username or mysql_user
            mysql_pass = parsed.password or mysql_pass
            mysql_db = parsed.path.lstrip("/") or mysql_db

        self.mysql_config = {
            "host": mysql_host,
            "port": mysql_port,
            "user": mysql_user,
            "password": mysql_pass,
            "database": mysql_db,
            "cursorclass": None,  # Will be set with pymysql.cursors.DictCursor
            "autocommit": True,
            "charset": "utf8mb4",
        }

        try:
            import pymysql
            self.mysql_config["cursorclass"] = pymysql.cursors.DictCursor

            # Test connection to MySQL server & auto-create database if not exists
            server_conn = pymysql.connect(
                host=mysql_host,
                port=mysql_port,
                user=mysql_user,
                password=mysql_pass,
                autocommit=True,
                charset="utf8mb4",
            )
            with server_conn.cursor() as cur:
                cur.execute(f"CREATE DATABASE IF NOT EXISTS `{mysql_db}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            server_conn.close()

            self.engine_type = "mysql"
            logger.info("Successfully connected to MySQL database: %s at %s:%s", mysql_db, mysql_host, mysql_port)
        except Exception as e:
            if allow_sqlite:
                logger.warning(
                    "MySQL connection attempt failed (%s). Falling back gracefully to SQLite database at %s",
                    e,
                    self.sqlite_path,
                )
                self.engine_type = "sqlite"
            else:
                logger.error("MySQL connection failure: %s", e)
                raise RuntimeError(
                    f"MySQL connection failed for {mysql_user}@{mysql_host}:{mysql_port}/{mysql_db}: {e}. "
                    "Ensure MySQL server is running on port 3306 and credentials in .env are correct."
                ) from e

    def _get_mysql_connection(self):
        import pymysql
        return pymysql.connect(**self.mysql_config)

    def _get_sqlite_connection(self):
        import sqlite3
        conn = sqlite3.connect(self.sqlite_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_database(self):
        """Initialize tables in MySQL (or SQLite if fallback permitted)."""
        if self.engine_type == "mysql":
            conn = self._get_mysql_connection()
            with conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS officers (
                        officer_id VARCHAR(64) PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        department VARCHAR(255) NOT NULL,
                        password_hash VARCHAR(128) NOT NULL,
                        role VARCHAR(32) DEFAULT 'inspector',
                        status VARCHAR(32) DEFAULT 'approved',
                        created_at VARCHAR(64) NOT NULL
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS inspections (
                        inspection_id VARCHAR(64) PRIMARY KEY,
                        officer_id VARCHAR(64),
                        officer_name VARCHAR(255),
                        status VARCHAR(32) NOT NULL,
                        score INT NOT NULL,
                        category VARCHAR(64),
                        product_name VARCHAR(255),
                        brand_name VARCHAR(255),
                        is_demo INT DEFAULT 0,
                        payload_json LONGTEXT NOT NULL,
                        created_at VARCHAR(64) NOT NULL,
                        INDEX idx_officer (officer_id),
                        INDEX idx_created (created_at),
                        INDEX idx_status (status)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS audit_logs (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        officer_id VARCHAR(64),
                        action VARCHAR(128) NOT NULL,
                        target_id VARCHAR(128),
                        details TEXT,
                        timestamp VARCHAR(64) NOT NULL
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)
            conn.close()
            logger.info("MySQL tables verified successfully.")
            return

        # Fallback SQLite Schema Initialization (only if fallback explicitly enabled)
        import sqlite3
        with self._get_sqlite_connection() as conn:
            cur = conn.cursor()
            cur.execute("""
                CREATE TABLE IF NOT EXISTS officers (
                    officer_id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    department TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT DEFAULT 'inspector',
                    status TEXT DEFAULT 'approved',
                    created_at TEXT NOT NULL
                )
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS inspections (
                    inspection_id TEXT PRIMARY KEY,
                    officer_id TEXT,
                    officer_name TEXT,
                    status TEXT NOT NULL,
                    score INTEGER NOT NULL,
                    category TEXT,
                    product_name TEXT,
                    brand_name TEXT,
                    is_demo INTEGER DEFAULT 0,
                    payload_json TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (officer_id) REFERENCES officers (officer_id)
                )
            """)
            cur.execute("CREATE INDEX IF NOT EXISTS idx_inspections_officer ON inspections(officer_id)")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_inspections_created ON inspections(created_at)")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status)")
            cur.execute("""
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    officer_id TEXT,
                    action TEXT NOT NULL,
                    target_id TEXT,
                    details TEXT,
                    timestamp TEXT NOT NULL
                )
            """)
            conn.commit()
            logger.info("SQLite database verified at %s", self.sqlite_path)

    def _migrate_from_json_if_needed(self):
        """Seed demo data & migrate legacy JSON files into the active database."""
        # Ensure default demo officers exist
        defaults = {
            "LM-DEMO-2026": {
                "officer_id": "LM-DEMO-2026",
                "name": "Demo Inspection Officer",
                "department": "Legal Metrology Department (Demo Session)",
                "password_hash": "2f6a6efb086e3f22da924c5fa57c8bfb0e14db835075a34bb22687a3cb98bc43", # sha256(demo2026)
                "role": "demo",
                "status": "approved",
                "created_at": "2026-01-01T00:00:00",
            },
            "LM-INSP-4092": {
                "officer_id": "LM-INSP-4092",
                "name": "Inspector A. Sharma",
                "department": "Legal Metrology Enforcement Wing",
                "password_hash": "2ffea71cf5a88c22da725175cfc1d0449432049e6f9d2fc3caae4fc911f95be8", # sha256(lm4092)
                "role": "inspector",
                "status": "approved",
                "created_at": "2026-01-01T00:00:00",
            },
            "LM-ADMIN-001": {
                "officer_id": "LM-ADMIN-001",
                "name": "Admin Controller",
                "department": "Central Legal Metrology Division",
                "password_hash": "5d3368297ea4b5f8be789f2cf0b5a1900115e45a2717e132ce4775d71682eaeb", # sha256(admin001)
                "role": "admin",
                "status": "approved",
                "created_at": "2026-01-01T00:00:00",
            },
        }

        for oid, odata in defaults.items():
            if not self.get_officer(oid):
                self.save_officer(odata)

        # Migrate inspections from JSON if database is empty
        all_insps = self.list_inspections(None)
        if len(all_insps) == 0 and os.path.exists(OLD_INSPECTIONS_FILE):
            try:
                with open(OLD_INSPECTIONS_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, dict):
                        data = list(data.values())
                    for item in data:
                        if not item.get("inspection_id"):
                            continue
                        if not item.get("officer_id"):
                            item["officer_id"] = "LM-DEMO-2026"
                            item["officer_name"] = "Demo Inspection Officer"
                        self.save_inspection(item)
                logger.info("Migrated historical inspections to %s database.", self.engine_type)
            except Exception as e:
                logger.error("Failed to migrate inspections JSON: %s", e)

    # ─────────────────────────────────────────────────────────────
    # INSPECTIONS CRUD
    # ─────────────────────────────────────────────────────────────

    def save_inspection(self, data: dict) -> dict:
        """Save or update an inspection record in MySQL/SQLite."""
        insp_id = data.get("inspection_id")
        oid = data.get("officer_id")
        oname = data.get("officer_name")
        status = data.get("status", "NEEDS_REVIEW")
        score = data.get("score", 0)
        category = data.get("category", "Other")
        is_demo = 1 if data.get("is_demo") else 0
        created_at = data.get("created_at", datetime.now().isoformat())

        p = data.get("product", {})
        p_name = p.get("product_name") or p.get("generic_name") or "Packaged Commodity"
        b_name = p.get("brand_name") or ""
        payload_str = json.dumps(data, ensure_ascii=False)

        if self.engine_type == "mysql":
            conn = self._get_mysql_connection()
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO inspections 
                    (inspection_id, officer_id, officer_name, status, score, category, product_name, brand_name, is_demo, payload_json, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        officer_id = VALUES(officer_id),
                        officer_name = VALUES(officer_name),
                        status = VALUES(status),
                        score = VALUES(score),
                        category = VALUES(category),
                        product_name = VALUES(product_name),
                        brand_name = VALUES(brand_name),
                        is_demo = VALUES(is_demo),
                        payload_json = VALUES(payload_json),
                        created_at = VALUES(created_at)
                """, (insp_id, oid, oname, status, score, category, p_name, b_name, is_demo, payload_str, created_at))
            conn.close()
        else:
            with self._get_sqlite_connection() as conn:
                cur = conn.cursor()
                cur.execute("""
                    INSERT INTO inspections 
                    (inspection_id, officer_id, officer_name, status, score, category, product_name, brand_name, is_demo, payload_json, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(inspection_id) DO UPDATE SET
                        officer_id = excluded.officer_id,
                        officer_name = excluded.officer_name,
                        status = excluded.status,
                        score = excluded.score,
                        category = excluded.category,
                        product_name = excluded.product_name,
                        brand_name = excluded.brand_name,
                        is_demo = excluded.is_demo,
                        payload_json = excluded.payload_json,
                        created_at = excluded.created_at
                """, (insp_id, oid, oname, status, score, category, p_name, b_name, is_demo, payload_str, created_at))
                conn.commit()

        # Record official audit log
        self.add_audit_log(
            oid,
            "INSPECTION_EVALUATED",
            insp_id,
            f"Package screening completed for '{p_name}'. Verdict: {status}, Compliance Score: {score}%",
        )

        return data

    def get_inspection(self, inspection_id: str) -> Optional[dict]:
        """Fetch a single inspection by ID."""
        if self.engine_type == "mysql":
            conn = self._get_mysql_connection()
            with conn.cursor() as cur:
                cur.execute("SELECT payload_json FROM inspections WHERE inspection_id = %s", (inspection_id,))
                row = cur.fetchone()
            conn.close()
            if row:
                try:
                    return json.loads(row["payload_json"])
                except Exception:
                    return None
            return None
        else:
            with self._get_sqlite_connection() as conn:
                cur = conn.cursor()
                cur.execute("SELECT payload_json FROM inspections WHERE inspection_id = ?", (inspection_id,))
                row = cur.fetchone()
                if row:
                    try:
                        return json.loads(row["payload_json"])
                    except Exception:
                        return None
            return None

    def list_inspections(self, officer_id: Optional[str] = None) -> List[dict]:
        """Fetch inspections sorted descending by creation time.
        Strictly isolated by officer_id.
        """
        rows = []
        if self.engine_type == "mysql":
            conn = self._get_mysql_connection()
            with conn.cursor() as cur:
                if officer_id and officer_id != "admin" and officer_id != "ALL":
                    cur.execute(
                        "SELECT payload_json FROM inspections WHERE officer_id = %s ORDER BY created_at DESC",
                        (officer_id,)
                    )
                else:
                    cur.execute("SELECT payload_json FROM inspections ORDER BY created_at DESC")
                rows = cur.fetchall()
            conn.close()
        else:
            with self._get_sqlite_connection() as conn:
                cur = conn.cursor()
                if officer_id and officer_id != "admin" and officer_id != "ALL":
                    cur.execute(
                        "SELECT payload_json FROM inspections WHERE officer_id = ? ORDER BY created_at DESC",
                        (officer_id,)
                    )
                else:
                    cur.execute("SELECT payload_json FROM inspections ORDER BY created_at DESC")
                rows = cur.fetchall()

        results = []
        for r in rows:
            try:
                results.append(json.loads(r["payload_json"]))
            except Exception:
                continue
        return results

    def clear_inspections(self):
        """Clear all inspection records."""
        if self.engine_type == "mysql":
            conn = self._get_mysql_connection()
            with conn.cursor() as cur:
                cur.execute("DELETE FROM inspections")
            conn.close()
        else:
            with self._get_sqlite_connection() as conn:
                cur = conn.cursor()
                cur.execute("DELETE FROM inspections")
                conn.commit()

    # ─────────────────────────────────────────────────────────────
    # OFFICERS CRUD
    # ─────────────────────────────────────────────────────────────

    def get_all_officers(self) -> List[dict]:
        """Get all registered officers."""
        if self.engine_type == "mysql":
            conn = self._get_mysql_connection()
            with conn.cursor() as cur:
                cur.execute("SELECT officer_id, name, department, role, status, created_at FROM officers ORDER BY created_at DESC")
                rows = cur.fetchall()
            conn.close()
            return [dict(r) for r in rows]
        else:
            with self._get_sqlite_connection() as conn:
                cur = conn.cursor()
                cur.execute("SELECT officer_id, name, department, role, status, created_at FROM officers ORDER BY created_at DESC")
                rows = cur.fetchall()
                return [dict(r) for r in rows]

    def get_officer(self, officer_id: str) -> Optional[dict]:
        """Get a single officer by ID."""
        if self.engine_type == "mysql":
            conn = self._get_mysql_connection()
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM officers WHERE officer_id = %s", (officer_id,))
                row = cur.fetchone()
            conn.close()
            return dict(row) if row else None
        else:
            with self._get_sqlite_connection() as conn:
                cur = conn.cursor()
                cur.execute("SELECT * FROM officers WHERE officer_id = ?", (officer_id,))
                row = cur.fetchone()
                return dict(row) if row else None

    def save_officer(self, officer: dict) -> dict:
        """Create or update an officer."""
        oid = officer["officer_id"]
        name = officer["name"]
        dept = officer["department"]
        phash = officer["password_hash"]
        role = officer.get("role", "inspector")
        status = officer.get("status", "approved")
        created_at = officer.get("created_at", datetime.now().isoformat())

        if self.engine_type == "mysql":
            conn = self._get_mysql_connection()
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO officers (officer_id, name, department, password_hash, role, status, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        name = VALUES(name),
                        department = VALUES(department),
                        password_hash = VALUES(password_hash),
                        role = VALUES(role),
                        status = VALUES(status)
                """, (oid, name, dept, phash, role, status, created_at))
            conn.close()
        else:
            with self._get_sqlite_connection() as conn:
                cur = conn.cursor()
                cur.execute("""
                    INSERT INTO officers (officer_id, name, department, password_hash, role, status, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(officer_id) DO UPDATE SET
                        name = excluded.name,
                        department = excluded.department,
                        password_hash = excluded.password_hash,
                        role = excluded.role,
                        status = excluded.status
                """, (oid, name, dept, phash, role, status, created_at))
                conn.commit()
        return officer

    def update_officer_status(self, officer_id: str, status: str) -> bool:
        """Update officer approval status."""
        if self.engine_type == "mysql":
            conn = self._get_mysql_connection()
            with conn.cursor() as cur:
                cur.execute("UPDATE officers SET status = %s WHERE officer_id = %s", (status, officer_id))
                affected = cur.rowcount
            conn.close()
            return affected > 0
        else:
            with self._get_sqlite_connection() as conn:
                cur = conn.cursor()
                cur.execute("UPDATE officers SET status = ? WHERE officer_id = ?", (status, officer_id))
                conn.commit()
                return cur.rowcount > 0

    def update_officer_role(self, officer_id: str, role: str) -> bool:
        """Update officer role."""
        if self.engine_type == "mysql":
            conn = self._get_mysql_connection()
            with conn.cursor() as cur:
                cur.execute("UPDATE officers SET role = %s WHERE officer_id = %s", (role, officer_id))
                affected = cur.rowcount
            conn.close()
            return affected > 0
        else:
            with self._get_sqlite_connection() as conn:
                cur = conn.cursor()
                cur.execute("UPDATE officers SET role = ? WHERE officer_id = ?", (role, officer_id))
                conn.commit()
                return cur.rowcount > 0

    def delete_officer(self, officer_id: str) -> bool:
        """Delete an officer."""
        if self.engine_type == "mysql":
            conn = self._get_mysql_connection()
            with conn.cursor() as cur:
                cur.execute("DELETE FROM officers WHERE officer_id = %s", (officer_id,))
                affected = cur.rowcount
            conn.close()
            if affected > 0:
                self.add_audit_log(officer_id, "OFFICER_DELETED", officer_id, f"Officer {officer_id} removed")
            return affected > 0
        else:
            with self._get_sqlite_connection() as conn:
                cur = conn.cursor()
                cur.execute("DELETE FROM officers WHERE officer_id = ?", (officer_id,))
                conn.commit()
                if cur.rowcount > 0:
                    self.add_audit_log(officer_id, "OFFICER_DELETED", officer_id, f"Officer {officer_id} removed")
                return cur.rowcount > 0

    # ─────────────────────────────────────────────────────────────
    # AUDIT LOGS CRUD
    # ─────────────────────────────────────────────────────────────

    def add_audit_log(self, officer_id: Optional[str], action: str, target_id: Optional[str], details: str):
        """Record an official audit log in MySQL/SQLite."""
        ts = datetime.now().isoformat()
        try:
            if self.engine_type == "mysql":
                conn = self._get_mysql_connection()
                with conn.cursor() as cur:
                    cur.execute("""
                        INSERT INTO audit_logs (officer_id, action, target_id, details, timestamp)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (officer_id, action, target_id, details, ts))
                conn.close()
            else:
                with self._get_sqlite_connection() as conn:
                    cur = conn.cursor()
                    cur.execute("""
                        INSERT INTO audit_logs (officer_id, action, target_id, details, timestamp)
                        VALUES (?, ?, ?, ?, ?)
                    """, (officer_id, action, target_id, details, ts))
                    conn.commit()
        except Exception as e:
            logger.warning("Failed to record audit log: %s", e)

    def list_audit_logs(self, limit: int = 100) -> List[dict]:
        """Fetch audit log records."""
        try:
            if self.engine_type == "mysql":
                conn = self._get_mysql_connection()
                with conn.cursor() as cur:
                    cur.execute("SELECT * FROM audit_logs ORDER BY id DESC LIMIT %s", (limit,))
                    rows = cur.fetchall()
                conn.close()
                return [dict(r) for r in rows]
            else:
                with self._get_sqlite_connection() as conn:
                    cur = conn.cursor()
                    cur.execute("SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?", (limit,))
                    rows = cur.fetchall()
                    return [dict(r) for r in rows]
        except Exception as e:
            logger.warning("Failed to fetch audit logs: %s", e)
            return []

    # ─────────────────────────────────────────────────────────────
    # STATS & DIAGNOSTICS
    # ─────────────────────────────────────────────────────────────

    def get_db_stats(self) -> dict:
        """Return database telemetry for settings and diagnostics."""
        total_inspections = 0
        total_officers = 0

        if self.engine_type == "mysql":
            try:
                conn = self._get_mysql_connection()
                with conn.cursor() as cur:
                    cur.execute("SELECT COUNT(*) as total FROM inspections")
                    total_inspections = cur.fetchone()["total"]
                    cur.execute("SELECT COUNT(*) as total FROM officers")
                    total_officers = cur.fetchone()["total"]
                conn.close()
                return {
                    "engine": "MySQL Relational Database",
                    "status": "Connected (Active)",
                    "host": f"{self.mysql_config.get('host')}:{self.mysql_config.get('port')}",
                    "database": self.mysql_config.get("database"),
                    "user": self.mysql_config.get("user"),
                    "total_inspections": total_inspections,
                    "total_officers": total_officers,
                    "user_isolation": True,
                    "supported_engines": ["MySQL Relational Database"],
                }
            except Exception as e:
                logger.error("Error getting MySQL stats: %s", e)
                return {
                    "engine": "MySQL Relational Database",
                    "status": f"Error: {e}",
                    "host": f"{self.mysql_config.get('host')}:{self.mysql_config.get('port')}",
                    "database": self.mysql_config.get("database"),
                    "total_inspections": 0,
                    "total_officers": 0,
                    "user_isolation": True,
                    "supported_engines": ["MySQL Relational Database"],
                }

        # Fallback SQLite Stats (only if SQLite fallback is explicitly enabled)
        with self._get_sqlite_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) as total FROM inspections")
            total_inspections = cur.fetchone()["total"]
            cur.execute("SELECT COUNT(*) as total FROM officers")
            total_officers = cur.fetchone()["total"]

        db_size_kb = 0
        if os.path.exists(self.sqlite_path):
            db_size_kb = round(os.path.getsize(self.sqlite_path) / 1024, 2)

        return {
            "engine": "SQLite 3 Relational SQL Engine",
            "status": "Active (Local Embedded)",
            "db_file": os.path.basename(self.sqlite_path),
            "db_path": self.sqlite_path,
            "db_size_kb": db_size_kb,
            "total_inspections": total_inspections,
            "total_officers": total_officers,
            "mysql_ready": True,
            "supported_engines": ["MySQL", "SQLite"],
        }


db_service = DatabaseService()
