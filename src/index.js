const http = require('http');
const fs = require('fs');

http.createServer(function(req, res) {

  if (req.method === 'POST' && req.url === '/submit_issue') {

    let body = "";

    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {

      try {
        const parsedBody = JSON.parse(body);
        const datetime = new Date();
        const issueDirectory = './issues/' + datetime.toISOString();

        fs.mkdir(issueDirectory, (err) => {
          if (err) {
            res.statusCode = 500;
            res.write("Error storing issue");
          }
          else {

            const reportPath = issueDirectory + '/report.txt';
            const reportFile = fs.createWriteStream(reportPath);

            if (parsedBody.email && parsedBody.message) {
              reportFile.write(parsedBody.email);
              reportFile.write('\n\n');
              reportFile.write(parsedBody.message);
              reportFile.write('\n');
            }
            else {
              res.statusCode = 400;
              res.write("Missing email or message");
            }
            reportFile.end();


            if (parsedBody.screenshot) {
              const screenshotPath = issueDirectory + '/screenshot.png';
              const screenshotFile = fs.createWriteStream(screenshotPath);
              const screenshot = Buffer.from(parsedBody.screenshot, 'base64');

              fs.writeFile(screenshotPath, screenshot, (err) => {
                if (err) {
                  res.statusCode = 500;
                  res.write("Error saving screenshot");
                }
              });
            }
          }

          res.end();
        });
      }
      catch (e) {
        res.statusCode = 400;
        res.write("Invalid JSON payload");
        res.end();
      }
    });
  }
  else {
    res.statusCode = 404;
    res.write("Not Found");
    res.end();
  }
}).listen(3000);
