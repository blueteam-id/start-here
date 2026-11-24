#!/usr/bin/env python3
"""Builds the downloadable lab files under public/labs/.

Run from the repository root after changing anything here:

    python3 scripts/labs/build_labs.py

Everything is fictional and deterministic (no randomness), so rebuilding
gives byte-identical files and the SHA-256 shown on the site stays stable.
Addresses come from the documentation ranges (RFC 5737: 192.0.2.0/24,
198.51.100.0/24, 203.0.113.0/24) and private ranges, so none are real.

Outputs:
  public/labs/programming-basics-python/auth.log
  public/labs/sql-basics/company.sql
  public/labs/sql-basics/company.db
"""

import os
import sqlite3

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LABS = os.path.join(ROOT, "public", "labs")


# ---------------------------------------------------------------------------
# Python track: a small SSH authentication log with a brute-force attempt
# ---------------------------------------------------------------------------

def build_auth_log():
    lines = []
    pid = 2200

    def add(time, text):
        nonlocal pid
        pid += 1
        lines.append(f"Nov 22 {time} web01 {text.format(pid=pid)}")

    add("01:00:01", "CRON[{pid}]: pam_unix(cron:session): session opened for user root(uid=0) by (uid=0)")
    add("01:12:40", "sshd[{pid}]: Accepted publickey for deploy from 10.0.0.5 port 50210 ssh2")
    add("01:31:08", "sshd[{pid}]: Failed password for dewi from 198.51.100.23 port 53011 ssh2")
    add("01:31:15", "sshd[{pid}]: Accepted password for dewi from 198.51.100.23 port 53012 ssh2")

    # A slow guesser trying a few common names.
    slow_users = ["test", "oracle", "ubuntu", "admin", "guest", "pi", "ftp", "user"]
    for i, user in enumerate(slow_users):
        add(f"01:4{i}:0{i}", f"sshd[{{pid}}]: Failed password for invalid user {user} from 192.0.2.77 port {41000 + i} ssh2")

    add("02:00:01", "CRON[{pid}]: pam_unix(cron:session): session opened for user root(uid=0) by (uid=0)")

    # A fast brute force: 30 failures, then a success for the backup account.
    fast_users = ["root", "admin", "root", "backup", "root", "support", "admin", "backup", "root", "oracle"]
    for i in range(30):
        user = fast_users[i % len(fast_users)]
        who = user if user in ("root", "backup") else f"invalid user {user}"
        add(f"02:10:{i:02d}", f"sshd[{{pid}}]: Failed password for {who} from 203.0.113.50 port {50100 + i} ssh2")
    add("02:10:42", "sshd[{pid}]: Accepted password for backup from 203.0.113.50 port 50131 ssh2")
    add("02:10:43", "sshd[{pid}]: pam_unix(sshd:session): session opened for user backup(uid=1003) by (uid=0)")

    add("02:30:01", "CRON[{pid}]: pam_unix(cron:session): session opened for user root(uid=0) by (uid=0)")
    add("02:47:19", "sshd[{pid}]: Accepted publickey for deploy from 10.0.0.5 port 50388 ssh2")

    path = os.path.join(LABS, "programming-basics-python", "auth.log")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", newline="\n") as f:
        f.write("\n".join(lines) + "\n")
    return path


# ---------------------------------------------------------------------------
# SQL track: a fictional company with one suspicious night
# ---------------------------------------------------------------------------

SCHEMA = """\
-- Practice database for the SQL Basics track on start.blueteam.id.
-- Everything here is fictional. Addresses use documentation and private ranges.

CREATE TABLE users (
  id          INTEGER PRIMARY KEY,
  username    TEXT NOT NULL UNIQUE,
  full_name   TEXT NOT NULL,
  department  TEXT NOT NULL,
  is_admin    INTEGER NOT NULL DEFAULT 0,  -- 1 = administrator
  active      INTEGER NOT NULL DEFAULT 1   -- 0 = account disabled
);

CREATE TABLE devices (
  id        INTEGER PRIMARY KEY,
  hostname  TEXT NOT NULL UNIQUE,
  os        TEXT NOT NULL,
  owner_id  INTEGER REFERENCES users(id)  -- NULL for shared servers
);

CREATE TABLE logins (
  id         INTEGER PRIMARY KEY,
  ts         TEXT NOT NULL,                -- 'YYYY-MM-DD HH:MM:SS'
  user_id    INTEGER NOT NULL REFERENCES users(id),
  device_id  INTEGER REFERENCES devices(id),  -- NULL = remote VPN login
  source_ip  TEXT NOT NULL,
  success    INTEGER NOT NULL              -- 1 = succeeded, 0 = failed
);

CREATE TABLE alerts (
  id         INTEGER PRIMARY KEY,
  ts         TEXT NOT NULL,
  severity   TEXT NOT NULL,                -- 'low', 'medium', 'high'
  rule       TEXT NOT NULL,
  user_id    INTEGER REFERENCES users(id),
  device_id  INTEGER REFERENCES devices(id),
  details    TEXT
);
"""

USERS = [
    (1, "andi", "Andi Pratama", "IT", 1, 1),
    (2, "budi", "Budi Santoso", "Finance", 0, 1),
    (3, "citra", "Citra Lestari", "Sales", 0, 1),
    (4, "dewi", "Dewi Anggraini", "HR", 0, 1),
    (5, "eko", "Eko Wijaya", "Sales", 0, 1),
    (6, "fajar", "Fajar Nugroho", "IT", 0, 1),
    (7, "gita", "Gita Permata", "Finance", 0, 1),
    (8, "hendra", "Hendra Kusuma", "Operations", 0, 1),
    (9, "indah", "Indah Sari", "Marketing", 0, 1),
    (10, "joko", "Joko Susilo", "Operations", 0, 0),
    (11, "rina", "Rina Maharani", "Finance", 0, 1),
    (12, "svc_backup", "Backup service account", "IT", 1, 1),
]

DEVICES = [
    (1, "LT-ANDI", "Windows 11", 1),
    (2, "LT-BUDI", "Windows 11", 2),
    (3, "LT-CITRA", "macOS 15", 3),
    (4, "LT-DEWI", "Windows 11", 4),
    (5, "LT-EKO", "Windows 11", 5),
    (6, "LT-FAJAR", "Ubuntu 24.04", 6),
    (7, "LT-GITA", "Windows 11", 7),
    (8, "LT-RINA", "Windows 11", 11),
    (9, "FS01", "Windows Server 2022", None),
    (10, "WEB01", "Ubuntu 24.04", None),
]


def build_logins():
    rows = []

    def add(ts, user, device, ip, success):
        rows.append((len(rows) + 1, ts, user, device, ip, success))

    # A normal working day, 2026-11-21.
    day = "2026-11-21"
    office = {1: "10.10.1.21", 2: "10.10.1.22", 3: "10.10.1.23", 4: "10.10.1.24",
              5: "10.10.1.25", 6: "10.10.1.26", 7: "10.10.1.27", 11: "10.10.1.31"}
    device_of = {1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 11: 8}
    morning = [(1, "07:58:12"), (2, "08:03:40"), (3, "08:11:05"), (4, "08:15:33"), (5, "08:20:19"),
               (6, "08:22:47"), (7, "08:30:02"), (11, "08:41:56")]
    for user, t in morning:
        add(f"{day} {t}", user, device_of[user], office[user], 1)
    add(f"{day} 09:02:10", 5, 5, office[5], 0)   # a typo
    add(f"{day} 09:02:31", 5, 5, office[5], 1)
    add(f"{day} 10:15:44", 9, None, "198.51.100.40", 1)  # Indah works from home on VPN
    add(f"{day} 13:05:09", 4, 4, office[4], 0)
    add(f"{day} 13:05:27", 4, 4, office[4], 1)
    add(f"{day} 14:30:51", 8, None, "198.51.100.61", 1)  # Hendra on VPN
    add(f"{day} 17:45:02", 12, 9, "10.10.0.9", 1)        # nightly backup job starts
    add(f"{day} 21:12:37", 3, None, "198.51.100.83", 1)  # Citra checks email late

    # The suspicious night: a password spray from one outside address.
    night = "2026-11-22"
    sprayed = [2, 3, 4, 5, 7, 8, 9, 11, 1, 6]
    for i, user in enumerate(sprayed):
        add(f"{night} 01:5{i}:0{i}", user, None, "203.0.113.50", 0)
    add(f"{night} 02:07:14", 11, None, "203.0.113.50", 0)
    add(f"{night} 02:07:39", 11, None, "203.0.113.50", 1)   # rina's account falls

    # The next morning, people log in as usual.
    for user, t in [(1, "07:55:03"), (2, "08:01:22"), (4, "08:12:40"), (7, "08:27:15")]:
        add(f"{night} {t}", user, device_of[user], office[user], 1)
    add(f"{night} 08:44:30", 11, 8, office[11], 1)          # the real rina, at her desk
    return rows


ALERTS = [
    (1, "2026-11-21 09:02:10", "low", "Failed login", 5, 5, "One failed login, followed by success."),
    (2, "2026-11-22 01:58:30", "medium", "Many failed logins from one address", None, None,
     "10 accounts failed from 203.0.113.50 within 10 minutes."),
    (3, "2026-11-22 02:07:39", "high", "Login from new country", 11, None,
     "First login for this account from 203.0.113.50."),
    (4, "2026-11-22 02:15:02", "high", "User added to admin group", 11, None,
     "rina was added to the administrators group."),
    (5, "2026-11-22 02:21:48", "high", "Large file download", 11, 9,
     "4.2 GB copied from FS01 share \\\\FS01\\finance."),
    (6, "2026-11-22 03:00:00", "low", "Backup job finished", 12, 9, "Nightly backup completed."),
]


def sql_literal(value):
    if value is None:
        return "NULL"
    if isinstance(value, int):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def build_sql_lab():
    logins = build_logins()
    parts = [SCHEMA, ""]
    for table, rows in [("users", USERS), ("devices", DEVICES), ("logins", logins), ("alerts", ALERTS)]:
        for row in rows:
            parts.append(f"INSERT INTO {table} VALUES ({', '.join(sql_literal(v) for v in row)});")
        parts.append("")
    sql = "\n".join(parts)

    folder = os.path.join(LABS, "sql-basics")
    os.makedirs(folder, exist_ok=True)
    sql_path = os.path.join(folder, "company.sql")
    with open(sql_path, "w", newline="\n") as f:
        f.write(sql)

    db_path = os.path.join(folder, "company.db")
    if os.path.exists(db_path):
        os.remove(db_path)
    con = sqlite3.connect(db_path)
    con.executescript(sql)
    con.commit()
    con.execute("VACUUM")
    con.close()
    return sql_path, db_path


if __name__ == "__main__":
    for p in [build_auth_log(), *build_sql_lab()]:
        print("wrote", os.path.relpath(p, ROOT))
