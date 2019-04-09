const http = require('http');
const fs = require('fs');

http.createServer(function(req, res) {


  if (req.url === '/submit_issue') {

    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'POST') {

      let body = "";

      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {

        let parsedBody;
        
        try {
          parsedBody = JSON.parse(body);
        }
        catch (e) {
          res.statusCode = 400;
          res.write("Invalid JSON payload");
        }

        console.log(parsedBody);

        if (parsedBody && parsedBody.email && parsedBody.message) {

          const datetime = new Date();
          const issueDirectory = './issues/' + datetime.toISOString();

          fs.mkdir(issueDirectory, (err) => {
            if (err) {
              res.statusCode = 500;
              res.write("Error storing issue");
            }
            else {

              const reportPath = issueDirectory + '/report.txt';
              console.log(reportPath);
              const reportFile = fs.createWriteStream(reportPath);

              reportFile.write(parsedBody.email);
              reportFile.write('\n\n');
              reportFile.write(parsedBody.message);
              reportFile.write('\n');
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
          });
        }
        else {
          res.statusCode = 400;
          res.write("Missing email or message");
        }

        res.end();
      });
    }
    else if (req.method === 'OPTIONS') {
      res.end();
    }
    else {
      res.statusCode = 405;
      res.write("Method not allowed");
      res.end();
    }
  }
  else {
    res.statusCode = 404;
    res.write("Not Found");
    res.end();
  }
}).listen(3000);
