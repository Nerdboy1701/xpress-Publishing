const express = require('express');
const seriesRouter = express.Router();
const issuesRouter = require('./issues');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    db.get(`SELECT * FROM Series WHERE Series.id = $seriesId`, {
        $seriesId: seriesId
    }, (err, series) => {
        if (err) {
            next(err);
        } else if (series) {
            req.series = series;
            next();
        } else {
            res.sendStatus(404);
        }
    })
})

seriesRouter.use('/:seriesId/issues', issuesRouter);

seriesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Series`, (err, series) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({series: series});
        }
    })
})

seriesRouter.get('/:seriesId', (req, res, next) => {
    res.status(200).json({series: req.series })
})

const validateSeries = (req, res, next) => {
    req.name = req.body.series.name;
    req.description = req.body.series.description;

    if (!req.name || !req.description) {
        return res.sendStatus(400);
    } else {
        next();
    }
}

seriesRouter.post('/', validateSeries, (req, res, next) => {
    db.run(`INSERT INTO Series (name, description) VALUES ($name, $description)`, {
        $name: req.name,
        $description: req.description
    }, function(err) {
        if (err) {
            next();
        } else {
            db.get(`SELECT * FROM Series WHERE Series.id = ${this.lastID}`, (err, series) => {
                res.status(201).json({series: series})
            })
        }
    })
})

seriesRouter.put('/:seriesId', validateSeries, (req, res, next) =>{
    db.run(`UPDATE Series SET name = "${req.name}", description = "${req.description}" WHERE Series.id = ${req.params.seriesId}`, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Series WHERE Series.id = ${req.params.seriesId}`, (err, series) => {
                res.status(200).json({series: series});
            })
        }
    })
})

module.exports = seriesRouter;
