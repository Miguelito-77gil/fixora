<?php
$dbPath = __DIR__ . '/database/restore-check/database.sqlite';

if (!file_exists($dbPath)) {
    exit("ERROR: SQLite backup not found.\n");
}

try {
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "=== DATABASE INTEGRITY ===\n";
    foreach ($pdo->query('PRAGMA integrity_check') as $row) {
        echo $row[0] . "\n";
    }

    echo "\n=== EXISTING TABLES AND RECORD COUNTS ===\n";
    $tables = $pdo->query(
        "SELECT name FROM sqlite_master
         WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
         ORDER BY name"
    )->fetchAll(PDO::FETCH_COLUMN);

    foreach ($tables as $table) {
        $safeTable = '"' . str_replace('"', '""', $table) . '"';
        $count = $pdo->query("SELECT COUNT(*) FROM $safeTable")->fetchColumn();
        printf("%-30s %d\n", $table, $count);
    }

    echo "\nBackup check completed. No records were modified.\n";
} catch (Throwable $e) {
    fwrite(STDERR, "ERROR: " . $e->getMessage() . "\n");
    exit(1);
}
