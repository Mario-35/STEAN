import fs from "fs";
// store all request in file Usefull for store all test 
export const requestToFile = (request: string) => {
    const logFile = fs.createWriteStream("test.log", { flags: "a" });
    logFile.write( request.replace(/\u001b[^m]*?m/g, "") + "\n" );
  };