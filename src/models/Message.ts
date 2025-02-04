import { Model } from "sequelize";
import { ModelUtils } from "../utils/model";
import { sequelize } from "./index"

class MessageModel extends Model { };

MessageModel.init({
  ...ModelUtils.standardColumns,
  from: ModelUtils.genericString(true),
  to: ModelUtils.genericString(true),
  payload: ModelUtils.genericString(true)
}, { modelName: "message", sequelize })

export default MessageModel;