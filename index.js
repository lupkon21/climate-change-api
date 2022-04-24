const PORT = 8080;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

const newspapers = require('./data.json');

const articles = [];

newspapers.forEach((newspaper) => {
    axios.get(newspaper.address).then((response) => {
        const html = response.data;
        const $ = cheerio.load(html);

        $('a:contains("climate")', html).each(function () {
            const title = $(this).text();
            const url = $(this).attr('href');

            articles.push({
                title,
                url: newspaper.base + url,
                source: newspaper.name,
            });
        });
    });
});

app.get('/', (req, res) => {
    res.json('Welcome to my Climate Change News API');
});

app.get('/news', (req, res) => {
    res.json(articles);
});

app.get('/news/:newspaperId', async (req, res) => {
    const newspaperId = req.params.newspaperId;

    const newspaperAdddress = newspapers.filter((newspaper) => newspaper.name == newspaperId)[0].address;
    const newspaperBase = newspapers.filter((newspaper) => newspaper.name == newspaperId)[0].base;

    axios
        .get(newspaperAdddress)
        .then((response) => {
            const html = response.data;
            const $ = cheerio.load(html);
            const specificArticles = [];

            $('a:contains("climate")', html).each(function () {
                const title = $(this).text();
                const url = $(this).attr('href');

                specificArticles.push({
                    title,
                    url: newspaperBase + url,
                    source: newspaperId,
                });
            });
            res.json(specificArticles);
        })
        .catch((err) => console.log(err));
});

app.listen(PORT, () => console.log(`server running on port ${PORT}`));
