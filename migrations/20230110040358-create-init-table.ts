"use strict";
require("../sql/setup");

import { QueryInterface } from "sequelize";
import { ModelUtils } from "../src/utils/model";

export const up = async (queryInterface: QueryInterface) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    // your migration here
    await queryInterface.sequelize.query("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";", { transaction });

    console.log("creating messages table");
    await queryInterface.createTable('messages', {
      ...ModelUtils.standardColumns,
      from: ModelUtils.genericString(true),
      to: ModelUtils.genericString(true),
      payload: ModelUtils.genericString(true)
    }, { transaction });

  })
};

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    // reverse the above
    queryInterface.dropTable("transfer");
  })
};
