const glob = require("glob");
const fs = require("fs");
const exif = require("jpeg-exif");
const Utimes = require("@ronomon/utimes");

const folderPath = process.argv.slice(2)[0];
const dateInFilenameRegex = /^(\d{4}-\d{2}-\d{2}) (\d{2})\.(\d{2})\.(\d{2}).*$/;

const getTimestamp = date => Math.round(date.getTime());

glob(`${folderPath}/**/*.jpg`, {}, function(er, files) {
  if (er !== null) {
    console.log("No files found.");
    return;
  }

  files.forEach(filePath => {
    const filename = filePath.split("/").pop();
    let fileDescriptor;

    try {
      fileDescriptor = fs.openSync(filePath, "r");
      const fileStats = fs.fstatSync(fileDescriptor);
      // const buffer = fs.readFileSync(filePath);
      // const exifData = exif.fromBuffer(buffer);

      // JSON.stringify(exifData) === "{}" ||
      // exifData.DateTime === undefined

      const hasDateInFilename = dateInFilenameRegex.test(filename);

      if (hasDateInFilename) {
        const matches = filename.match(dateInFilenameRegex);
        const formattedDate = `${matches[1]} ${matches[2]}:${matches[3]}:${
          matches[4]
        }`;
        const timestamp = getTimestamp(new Date(formattedDate));

        const btime = timestamp;
        const mtime = timestamp;
        const atime = undefined;

        Utimes.utimes(filePath, btime, mtime, atime, () => {
          console.log(filePath);
          console.log(`- Formatted date: "${formattedDate}"`);
          console.log(`- Timestamp: "${timestamp}"`);
          console.log(`- Birth date and modified date updated`);
          console.log("");
        });
      } else {
        console.log(filePath);
        console.log(`- No date in filename that can be added`);
      }
    } catch (err) {
      /* Handle the error */
      console.err(err);
    } finally {
      if (fileDescriptor !== undefined) {
        fs.closeSync(fileDescriptor);
      }
    }
  });
});
