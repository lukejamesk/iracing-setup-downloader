import { cp } from "fs";
import { CONFIG } from "./config";

export const copyFiles = () => {
  cp(
    "./setups",
    `${CONFIG.iracingDocumentsPath}/setups`,
    { recursive: true, force: false },
    (err) => {
      if (err) {
        console.error("Error copying setups:", err);
      } else {
        console.log("Setups copied successfully.");
      }
      process.exit();
    }
  );
};
