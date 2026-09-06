const Database = require("better-sqlite3");

const source = new Database("./src/db/fixora.db", {
  readonly: true
});

const backupPath = "./src/db/fixora-migration-copy.db";

source.backup(backupPath)
  .then(() => {
    console.log("BACKUP COMPLETE:", backupPath);

    const check = new Database(backupPath, {
      readonly: true
    });

    const tables = check
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all();

    console.log("TABLES:");
    console.log(tables);

    const users = check
      .prepare("SELECT COUNT(*) AS count FROM users")
      .get();

    const profiles = check
      .prepare("SELECT COUNT(*) AS count FROM repairer_profiles")
      .get();

    const requests = check
      .prepare("SELECT COUNT(*) AS count FROM repair_requests")
      .get();

    const reviews = check
      .prepare("SELECT COUNT(*) AS count FROM reviews")
      .get();

    console.log("COUNTS:");
    console.log({
      users: users.count,
      repairer_profiles: profiles.count,
      repair_requests: requests.count,
      reviews: reviews.count
    });

    check.close();
    source.close();
  })
  .catch((error) => {
    console.error("BACKUP FAILED:");
    console.error(error);
    source.close();
    process.exit(1);
  });
