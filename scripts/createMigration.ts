import fs from "fs";
import moment from "moment";
import path from "path";

const TEMPLATE = `
"use strict";
require("../sql/setup");

import { QueryInterface } from "sequelize";

export const up = async (queryInterface: QueryInterface) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    // your migration here
  })
};

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    // reverse the above
  })
};
`;

(async () => {
  const newMigrationFile = path.join("migrations/", [
    moment().format("YYYYMMDDHHmmss"),
    ...process.argv.slice(2),
  ].join("-") + ".ts");

  fs.writeFileSync(newMigrationFile, TEMPLATE);
  console.log("migration file created");
  console.log(newMigrationFile);
})().catch(console.error).finally(() => process.exit(0));
