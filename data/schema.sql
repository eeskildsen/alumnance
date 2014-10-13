CREATE TABLE alums (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	is_present INTEGER NOT NULL DEFAULT 0,
	name TEXT NOT NULL,
	maiden_name TEXT,
	class_of INTEGER TEXT
);

CREATE TABLE schools (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL
);

CREATE TABLE alum_school (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	school_id INTEGER NOT NULL,
	alum_id INTEGER NOT NULL,
	FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
	FOREIGN KEY (alum_id) REFERENCES alums(id) ON DELETE CASCADE
);