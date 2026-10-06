const fs = require('fs');
const path = require('path');

const handleFileUpload = (file, uploadDir) => {
    return new Promise((resolve, reject) => {
    if (!file) {
      return resolve("");
    }
console.log(file.originalName)
    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const filename = file.filename+extension;
    const filePath = path.join(uploadDir, filename);

    fs.rename(file.path, filePath, function (err) {
      if (err) {
        return reject(err);
      }
      resolve(filename);
    });
  });
};

module.exports = {
  handleFileUpload
};
