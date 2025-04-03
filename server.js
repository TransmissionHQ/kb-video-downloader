const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

app.get('/download', async (req, res) => {
    const videoPageUrl = req.query.url;
    try {
        const pageResponse = await axios.get(videoPageUrl);
        const $ = cheerio.load(pageResponse.data);

        const videoUrl = $('meta[property="og:video"]').attr('content');

        if (!videoUrl) {
            return res.status(404).send('Video URL not found on the page.');
        }

        const videoStream = await axios({
            url: videoUrl,
            method: 'GET',
            responseType: 'stream'
        });

        res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
        res.setHeader('Content-Type', 'video/mp4');
        videoStream.data.pipe(res);

    } catch (error) {
        res.status(500).send('Error fetching video.');
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
