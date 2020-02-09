const http = require("http");

const content = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>fetch harness</title>
    <meta charset="utf-8">
  </head>
  <body>
    <script>

      console.log("fetching data...");
      fetch("/data")
        .then(response => {
          console.log("data:", response.headers);
          return response.text();
        })
        .then(text => {
          console.log("data:", text);
        })
        .catch(error => {
          console.error("data:", error);
        });

      console.log("fetching data-chunked...");
      fetch("/data-chunked")
        .then(response => {
          console.log("data-chunked:", response.headers);
          return response.text();
        })
        .then(text => {
          console.log("data-chunked:", text);
        })
        .catch(error => {
          console.error("data-chunked:", error);
        });

      const controller = new AbortController();
      const signal = controller.signal;

      console.log("fetching abort data-chunked...");
      fetch("/data-chunked", { signal })
        .then(response => {
          console.log("abort data-chunked:", response.headers);
          setTimeout(() => controller.abort(), 0);
          return response.text();
        })
        .then(text => {
          console.log("abort data-chunked:", text);
        })
        .catch(error => {
          console.error("abort data-chunked:", error);
        });

    </script>
  </body>
</html>
`;

const data = "[0123456789]";

const server = http.createServer((req, res) => {
  console.log(req.url);

  if (req.url === "/") {
    res.end(content.trim());
    return;
  }

  if (req.url === "/data") {
    res.end(data);
    return;
  }

  if (req.url === "/data-chunked") {
    // https://github.com/nodejs/node/issues/30182#issuecomment-548491899
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
      "Content-Length": data.length * 3
    });
    res.flushHeaders();
    setTimeout(() => {
      res.write(data);
    }, 1000);
    setTimeout(() => {
      res.write(data);
    }, 2000);
    setTimeout(() => {
      res.write(data);
      res.end();
    }, 3000);
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(8008);