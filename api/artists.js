const express = require('express');
const artistsRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


artistsRouter.param('artistId', (req, res, next, artistId) => {
    db.get('SELECT * FROM Artist WHERE Artist.id = $artistId', {
        $artistId: artistId
    }, (err, artist) => {
        if (err) {
            next(err);
        } else if (artist) {
            req.artist = artist;
            next();
        } else {
            res.sendStatus(404);
        }
    })
});

artistsRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Artist WHERE Artist.is_currently_employed = 1', (err, artists) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({artists: artists});
        }
    });
});


artistsRouter.get('/:artistId', (req, res, next) => {
    res.status(200).json({artist: req.artist});
})

const validateArtist = (req, res, next) => {
    req.name = req.body.artist.name;
    req.dateOfBirth = req.body.artist.dateOfBirth;
    req.biography = req.body.artist.biography;
    req.isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
    
    if (!req.name || !req.dateOfBirth || !req.biography) {
        return res.sendStatus(400);
    } else {
        next();
    }
}

artistsRouter.post('/', validateArtist, (req, res, next) => {
    db.run(`INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)`, {
        $name: req.name,
        $dateOfBirth: req.dateOfBirth,
        $biography: req.biography,
        $isCurrentlyEmployed: req.isCurrentlyEmployed
    }, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE Artist.id = ${this.lastID}`, (err, artist) => {
              res.status(201).json({artist: artist});
            })
        }
    })
})

artistsRouter.put('/:artistId', validateArtist, (req, res, next) => {
    db.run(`UPDATE Artist SET name = "${req.name}", date_of_birth = "${req.dateOfBirth}", biography = "${req.biography}", is_currently_employed = "${req.isCurrentlyEmployed}" WHERE Artist.id = "${req.params.artistId}"`, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`, (err, artist) => {
                res.status(200).json({artist: artist});
            })  
        }
    })
})

artistsRouter.delete('/:artistId', (req, res, next) => {
    db.run(`UPDATE Artist SET is_currently_employed = 0 WHERE Artist.id = $artistId`, {
        $artistId: req.params.artistId
    }, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`, (err, artist) => {
                res.status(200).json({artist: artist});
            })
        }
    })
})

module.exports = artistsRouter;