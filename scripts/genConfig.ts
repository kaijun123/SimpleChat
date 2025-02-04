import config from "../sql/config";
import fs from "fs"

;
(async () => {
  const nodeEnv = process.env.ENVIRONMENT || "development"
  const configJson = JSON.stringify({
    [nodeEnv]: config[nodeEnv]
  }, null, 2)
  console.log(configJson)
  await fs.writeFile("./sql/config.json", configJson, (err) => {
    if (err) {
      console.log(err)
    }
    else {
      console.log("Migration config written")
    }
  })
})()
