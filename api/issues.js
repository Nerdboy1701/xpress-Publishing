const express = require('express');
const issuesRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.param('issueId', (req, res, next, issueId) => {
    db.get(`SELECT * FROM Issue WHERE Issue.id = $issueId`, {
        $issueId: issueId
    }, (err, issue) => {
        if (err) {
            next(err);
        } else if (issue) {
            next();
        } else {
            res.sendStatus(404);
        }
    })
});

issuesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Issue WHERE Issue.series_id = $seriesId`, {
        $seriesId: req.params.seriesId
    }, (err, issues) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({issues: issues});
        }
    })
})

const validateIssue = (req, res, next) => {
    req.name = req.body.issue.name;
    req.issueNumber = req.body.issue.issueNumber;
    req.publicationDate = req.body.issue.publicationDate;
    req.artistId = req.body.issue.artistId;

    db.get(`SELECT * FROM Artist WHERE Artist.id = $artistId`, {
        $artistId: req.artistId
    }, (err, artist) => {
        if (err) {
            next(err);
        } else {
            if (!req.name || !req.issueNumber || !req.publicationDate || !req.artistId) {
                return res.sendStatus(400);
            } else {
                next();
            }
        }
    })  
}

issuesRouter.post('/', validateIssue, (req, res, next) => {
    db.run(`INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)`, {
        $name: req.name,
        $issueNumber: req.issueNumber,
        $publicationDate: req.publicationDate,
        $artistId: req.artistId,
        $seriesId: req.params.seriesId
    }, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Issue WHERE Issue.id = ${this.lastID}`, (err, issue) => {
                res.status(201).json({issue: issue})
            })
        }
    })
})

issuesRouter.put('/:issueId', validateIssue, (req, res, next) => {
    db.run(`UPDATE Issue SET name = $name, issue_number = $issueNumber, publication_date = $publicationDate,  artist_id = $artistId WHERE Issue.id = $issueId`, {
        $name: req.name,
        $issueNumber: req.issueNumber,
        $publicationDate: req.publicationDate,
        $artistId: req.artistId,
        $issueId: req.params.issueId
    }, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Issue WHERE Issue.id = ${req.params.issueId}`, (err, issue) => {
                res.status(200).json({issue: issue});
            })
        }
    })
})

issuesRouter.delete('/:issueId', (req, res, next) => {
    db.run(`DELETE FROM Issue WHERE Issue.id = $issueId`, {
        $issueId: req.params.issueId
    }, (err) => {
        if (err) {
            next(err);
        } else {
            res.sendStatus(204);
        }
    })
})

module.exports = issuesRouter;
