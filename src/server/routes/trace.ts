import fs from "fs";

export const requestToFile = (request: string) => {
    const logFile = fs.createWriteStream("test.log", { flags: "a" });
    logFile.write( request.replace(/\u001b[^m]*?m/g, "") + "\n" );
  };