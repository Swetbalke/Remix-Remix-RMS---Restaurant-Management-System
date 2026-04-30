import fs from "fs";

function findFiles(dir, name) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f === "node_modules" || f === ".git") continue;
    const path = dir + "/" + f;
    if (fs.statSync(path).isDirectory()) {
      findFiles(path, name);
    } else if (f === name) {
      console.log(path);
    }
  }
}

findFiles(".", "dev.db");
