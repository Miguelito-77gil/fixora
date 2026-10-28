<?php
$dbPath = __DIR__ . '/database/restore-check/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$tables = $pdo->query(
    "SELECT name FROM sqlite_master
     WHERE type='table' AND name NOT LIKE 'sqlite_%'
     ORDER BY name"
)->fetchAll(PDO::FETCH_COLUMN);

foreach ($tables as $table) {
    echo "\n=== TABLE: $table ===\n";
    $safe = '"' . str_replace('"', '""', $table) . '"';

    foreach ($pdo->query("PRAGMA table_info($safe)") as $col) {
        printf(
            "%-28s %-16s %s\n",
            $col['name'],
            $col['type'],
            $col['notnull'] ? 'NOT NULL' : 'NULLABLE'
        );
    }
}

echo "\n=== APPLIED MIGRATIONS ===\n";
$hasMigrations = in_array('migrations', $tables, true);
if ($hasMigrations) {
    foreach ($pdo->query(
        "SELECT migration, batch FROM migrations ORDER BY batch, migration"
    ) as $row) {
        echo $row['migration'] . " | batch " . $row['batch'] . "\n";
    }
}
