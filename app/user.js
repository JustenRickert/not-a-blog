const fs = require("fs");
const path = require("path");

const dataDirectory = path.join(process.cwd(), "data");

if (!fs.existsSync(dataDirectory)) fs.mkdirSync(dataDirectory);

module.exports.newUser = (username, password) =>
  new Promise((resolve, reject) => {
    const usernameFile = path.join(dataDirectory, username + ".json");
    fs.access(usernameFile, fs.constants.F_OK, notExists => {
      if (notExists) {
        fs.writeFile(
          usernameFile,
          JSON.stringify({ username, password }),
          err => {
            if (err) throw err;
            return resolve();
          }
        );
      } else return reject();
    });
  });

module.exports.authenticateUser = (username, password) =>
  new Promise((resolve, reject) => {
    const usernameFile = path.join(dataDirectory, username + ".json");
    fs.access(usernameFile, fs.constants.F_OK, notExists => {
      if (notExists) return reject();
      else {
        fs.readFile(usernameFile, (err, data) => {
          if (err) throw err;
          const json = JSON.parse(data);
          if (json.username === username && json.password === json.password) {
            return resolve();
          } else return reject();
        });
      }
    });
  });
