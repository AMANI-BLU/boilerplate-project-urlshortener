require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const url = require('url');
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});



app.use(bodyParser.urlencoded({ extended: false }));

let urlDatabase = [];
let idCounter = 1;

app.post('/api/shorturl', (req, res) => {
    const originalUrl = req.body.url;
    const parsedUrl = url.parse(originalUrl);

    // Check if the URL has a valid format
    if (!parsedUrl.protocol || !parsedUrl.hostname) {
        return res.json({ error: 'invalid url' });
    }

    // Validate the hostname using dns.lookup
    dns.lookup(parsedUrl.hostname, (err) => {
        if (err) {
            return res.json({ error: 'invalid url' });
        }

        // If valid, store the original URL and generate a short URL
        const shortUrl = idCounter;
        urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });
        idCounter++;

        // Respond with the original and short URLs
        res.json({ original_url: originalUrl, short_url: shortUrl });
    });
});

app.get('/api/shorturl/:shortUrl', (req, res) => {
    const shortUrl = parseInt(req.params.shortUrl);

    // Find the original URL by the short URL ID
    const urlEntry = urlDatabase.find(entry => entry.short_url === shortUrl);

    if (urlEntry) {
        // Redirect to the original URL
        res.redirect(urlEntry.original_url);
    } else {
        res.json({ error: 'No short URL found for the given input' });
    }
});
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
