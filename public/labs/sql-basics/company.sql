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


INSERT INTO users VALUES (1, 'andi', 'Andi Pratama', 'IT', 1, 1);
INSERT INTO users VALUES (2, 'budi', 'Budi Santoso', 'Finance', 0, 1);
INSERT INTO users VALUES (3, 'citra', 'Citra Lestari', 'Sales', 0, 1);
INSERT INTO users VALUES (4, 'dewi', 'Dewi Anggraini', 'HR', 0, 1);
INSERT INTO users VALUES (5, 'eko', 'Eko Wijaya', 'Sales', 0, 1);
INSERT INTO users VALUES (6, 'fajar', 'Fajar Nugroho', 'IT', 0, 1);
INSERT INTO users VALUES (7, 'gita', 'Gita Permata', 'Finance', 0, 1);
INSERT INTO users VALUES (8, 'hendra', 'Hendra Kusuma', 'Operations', 0, 1);
INSERT INTO users VALUES (9, 'indah', 'Indah Sari', 'Marketing', 0, 1);
INSERT INTO users VALUES (10, 'joko', 'Joko Susilo', 'Operations', 0, 0);
INSERT INTO users VALUES (11, 'rina', 'Rina Maharani', 'Finance', 0, 1);
INSERT INTO users VALUES (12, 'svc_backup', 'Backup service account', 'IT', 1, 1);

INSERT INTO devices VALUES (1, 'LT-ANDI', 'Windows 11', 1);
INSERT INTO devices VALUES (2, 'LT-BUDI', 'Windows 11', 2);
INSERT INTO devices VALUES (3, 'LT-CITRA', 'macOS 15', 3);
INSERT INTO devices VALUES (4, 'LT-DEWI', 'Windows 11', 4);
INSERT INTO devices VALUES (5, 'LT-EKO', 'Windows 11', 5);
INSERT INTO devices VALUES (6, 'LT-FAJAR', 'Ubuntu 24.04', 6);
INSERT INTO devices VALUES (7, 'LT-GITA', 'Windows 11', 7);
INSERT INTO devices VALUES (8, 'LT-RINA', 'Windows 11', 11);
INSERT INTO devices VALUES (9, 'FS01', 'Windows Server 2022', NULL);
INSERT INTO devices VALUES (10, 'WEB01', 'Ubuntu 24.04', NULL);

INSERT INTO logins VALUES (1, '2026-11-21 07:58:12', 1, 1, '10.10.1.21', 1);
INSERT INTO logins VALUES (2, '2026-11-21 08:03:40', 2, 2, '10.10.1.22', 1);
INSERT INTO logins VALUES (3, '2026-11-21 08:11:05', 3, 3, '10.10.1.23', 1);
INSERT INTO logins VALUES (4, '2026-11-21 08:15:33', 4, 4, '10.10.1.24', 1);
INSERT INTO logins VALUES (5, '2026-11-21 08:20:19', 5, 5, '10.10.1.25', 1);
INSERT INTO logins VALUES (6, '2026-11-21 08:22:47', 6, 6, '10.10.1.26', 1);
INSERT INTO logins VALUES (7, '2026-11-21 08:30:02', 7, 7, '10.10.1.27', 1);
INSERT INTO logins VALUES (8, '2026-11-21 08:41:56', 11, 8, '10.10.1.31', 1);
INSERT INTO logins VALUES (9, '2026-11-21 09:02:10', 5, 5, '10.10.1.25', 0);
INSERT INTO logins VALUES (10, '2026-11-21 09:02:31', 5, 5, '10.10.1.25', 1);
INSERT INTO logins VALUES (11, '2026-11-21 10:15:44', 9, NULL, '198.51.100.40', 1);
INSERT INTO logins VALUES (12, '2026-11-21 13:05:09', 4, 4, '10.10.1.24', 0);
INSERT INTO logins VALUES (13, '2026-11-21 13:05:27', 4, 4, '10.10.1.24', 1);
INSERT INTO logins VALUES (14, '2026-11-21 14:30:51', 8, NULL, '198.51.100.61', 1);
INSERT INTO logins VALUES (15, '2026-11-21 17:45:02', 12, 9, '10.10.0.9', 1);
INSERT INTO logins VALUES (16, '2026-11-21 21:12:37', 3, NULL, '198.51.100.83', 1);
INSERT INTO logins VALUES (17, '2026-11-22 01:50:00', 2, NULL, '203.0.113.50', 0);
INSERT INTO logins VALUES (18, '2026-11-22 01:51:01', 3, NULL, '203.0.113.50', 0);
INSERT INTO logins VALUES (19, '2026-11-22 01:52:02', 4, NULL, '203.0.113.50', 0);
INSERT INTO logins VALUES (20, '2026-11-22 01:53:03', 5, NULL, '203.0.113.50', 0);
INSERT INTO logins VALUES (21, '2026-11-22 01:54:04', 7, NULL, '203.0.113.50', 0);
INSERT INTO logins VALUES (22, '2026-11-22 01:55:05', 8, NULL, '203.0.113.50', 0);
INSERT INTO logins VALUES (23, '2026-11-22 01:56:06', 9, NULL, '203.0.113.50', 0);
INSERT INTO logins VALUES (24, '2026-11-22 01:57:07', 11, NULL, '203.0.113.50', 0);
INSERT INTO logins VALUES (25, '2026-11-22 01:58:08', 1, NULL, '203.0.113.50', 0);
INSERT INTO logins VALUES (26, '2026-11-22 01:59:09', 6, NULL, '203.0.113.50', 0);
INSERT INTO logins VALUES (27, '2026-11-22 02:07:14', 11, NULL, '203.0.113.50', 0);
INSERT INTO logins VALUES (28, '2026-11-22 02:07:39', 11, NULL, '203.0.113.50', 1);
INSERT INTO logins VALUES (29, '2026-11-22 07:55:03', 1, 1, '10.10.1.21', 1);
INSERT INTO logins VALUES (30, '2026-11-22 08:01:22', 2, 2, '10.10.1.22', 1);
INSERT INTO logins VALUES (31, '2026-11-22 08:12:40', 4, 4, '10.10.1.24', 1);
INSERT INTO logins VALUES (32, '2026-11-22 08:27:15', 7, 7, '10.10.1.27', 1);
INSERT INTO logins VALUES (33, '2026-11-22 08:44:30', 11, 8, '10.10.1.31', 1);

INSERT INTO alerts VALUES (1, '2026-11-21 09:02:10', 'low', 'Failed login', 5, 5, 'One failed login, followed by success.');
INSERT INTO alerts VALUES (2, '2026-11-22 01:58:30', 'medium', 'Many failed logins from one address', NULL, NULL, '10 accounts failed from 203.0.113.50 within 10 minutes.');
INSERT INTO alerts VALUES (3, '2026-11-22 02:07:39', 'high', 'Login from new country', 11, NULL, 'First login for this account from 203.0.113.50.');
INSERT INTO alerts VALUES (4, '2026-11-22 02:15:02', 'high', 'User added to admin group', 11, NULL, 'rina was added to the administrators group.');
INSERT INTO alerts VALUES (5, '2026-11-22 02:21:48', 'high', 'Large file download', 11, 9, '4.2 GB copied from FS01 share \\FS01\finance.');
INSERT INTO alerts VALUES (6, '2026-11-22 03:00:00', 'low', 'Backup job finished', 12, 9, 'Nightly backup completed.');
