
import Sequelize, { DataTypes, ModelAttributeColumnOptions } from "sequelize";

export class ModelUtils {
  public static genericString = (required = false, unique = false, length?: number): ModelAttributeColumnOptions => ({
    type: Sequelize.STRING,
    allowNull: !required,
    unique: unique,
    validate: {
      ...length && {
        len: [0, length],
      },

      ...required && {
        notEmpty: required
      },
    },
  });
  public static number = (required = false, defaultValue?: number): ModelAttributeColumnOptions => ({
    type: Sequelize.INTEGER,
    allowNull: !required,
    defaultValue,
  });
  public static timestamp = (required = false, defaultValue?: Sequelize.AbstractDataTypeConstructor): ModelAttributeColumnOptions => ({
    type: Sequelize.DATE,
    allowNull: !required,
    defaultValue,
  });
  public static date = (required = false): ModelAttributeColumnOptions => ({
    type: Sequelize.DATEONLY,
    allowNull: !required,
  });
  public static boolean = (required = false, defaultValue?: boolean): ModelAttributeColumnOptions => ({
    type: Sequelize.BOOLEAN,
    allowNull: !required,
    defaultValue,
  });
  public static ipAddress = (required = false): ModelAttributeColumnOptions => ({
    type: Sequelize.STRING,
    allowNull: !required,
    validate: { isIP: true, notEmpty: required },
  });
  public static foreignKey = (refTable: string, refCol: string = "id", required = false, type: Sequelize.DataType = Sequelize.STRING, onDelete: string | undefined = undefined): ModelAttributeColumnOptions => ({
    type,
    allowNull: !required,
    onDelete,
    references: { model: refTable, key: refCol },
  });
  public static primaryKey = (): ModelAttributeColumnOptions => ({
    type: Sequelize.UUID,
    defaultValue: Sequelize.literal("uuid_generate_v4()"),
    primaryKey: true,
    allowNull: false,
  });
  public static text = (required = false): ModelAttributeColumnOptions => ({
    type: Sequelize.TEXT,
    allowNull: !required,
  });
  public static decimal = (m = 36, d = 0, required = false): ModelAttributeColumnOptions => ({
    type: Sequelize.DECIMAL(m, d),
    allowNull: !required,
  });
  public static enumType = (values: string[] = [], required = false): ModelAttributeColumnOptions => ({
    type: Sequelize.DataTypes.ENUM(...values),
    allowNull: !required,
  });
  public static jsonType = (required = false): ModelAttributeColumnOptions => ({
    type: Sequelize.DataTypes.JSONB,
    allowNull: !required,
  });

  public static standardColumns = {
    id: this.primaryKey(),
    createdAt: this.timestamp(true, DataTypes.NOW),
    updatedAt: this.timestamp(),
    // deletedAt: timestamp(),
  };
}