const express = require('express');
const fs = require('fs');
const mysql = require('mysql');

const json = fs.readFileSync('credentials.json', 'utf8');
const credentials = JSON.parse(json);
const connection = mysql.createConnection(credentials);

var path = require('path');
const service = express();
service.use(express.json());

// .get ('/report.html',....) use sendFile (Should be about one line)

connection.connect(error => {
    if (error) {
        console.error(error);
        process.exit(1);
    }
});

service.get('/report.html', function(req, res) {
    res.sendFile('/report.html', { root: __dirname })
});

const port = 5001;
service.listen(port, () => {
    console.log(`We're live on port ${port}!`);
});

service.use((request, response, next) => {
    response.set('Access-Control-Allow-Origin', '*');
    next();
});

service.options('*', (request, response) => {
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
    response.sendStatus(200);
});


const selectQuery = 'SELECT * FROM project2';
connection.query(selectQuery, (error, rows) => {
    if (error) {
        console.error(error);
    } else {
        console.log(rows);
    }
});



function rowToQuestion(row) {
    return {
        id: row.id,
        question: row.question,
        answer1: row.answer1,
        answer2: row.answer2,
        answer3: row.answer3,
        answer4: row.answer4,
        correct_ans: row.correct_ans,
    };
}


service.get('/questions/:id', (request, response) => {
    const parameters = [
        parseInt(request.params.id),
    ];
    const query = 'SELECT * FROM project2 WHERE id = ? AND is_deleted = 0';
    connection.query(query, parameters, (error, rows) => {
        if (error) {
            response.status(500);
            response.json({
                ok: false,
                results: error.message,
            });
        } else {
            const question = rows.map(rowToQuestion);
            response.json({
                ok: true,
                results: rows.map(rowToQuestion),
            });
        }
    });
});


service.get('/', (request, response) => {
    const query = 'SELECT * FROM project2 WHERE is_deleted = 0';
    connection.query(query, (error, rows) => {
        if (error) {
            response.status(500);
            response.json({
                ok: false,
                results: error.message,
            });
        } else {
            const question = rows.map(rowToQuestion);
            response.json({
                ok: true,
                results: rows.map(rowToQuestion),
            });
        }
    });
});

service.get('/deleted', (request, response) => {
    const query = 'SELECT * FROM project2 WHERE is_deleted = 1';
    connection.query(query, (error, rows) => {
        if (error) {
            response.status(500);
            response.json({
                ok: false,
                results: error.message,
            });
        } else {
            const question = rows.map(rowToQuestion);
            response.json({
                ok: true,
                results: rows.map(rowToQuestion),
            });
        }
    });
});

service.post('/questions', (request, response) => {
    if (request.body.hasOwnProperty('question') &&
        request.body.hasOwnProperty('answer1') &&
        request.body.hasOwnProperty('answer2') &&
        request.body.hasOwnProperty('answer3') &&
        request.body.hasOwnProperty('answer4') &&
        request.body.hasOwnProperty('correct_ans')) {

        const parameters = [
            request.body.question,
            request.body.answer1,
            request.body.answer2,
            request.body.answer3,
            request.body.answer4,
            request.body.correct_ans,
        ];

        const query = 'INSERT INTO project2(question, answer1, answer2, answer3, answer4, correct_ans) VALUES (?, ?, ?, ?, ?, ?)';
        connection.query(query, parameters, (error, result) => {
            if (error) {
                response.status(500);
                response.json({
                    ok: false,
                    results: error.message,
                });
            } else {
                response.json({
                    ok: true,
                    results: result.insertId,
                });
            }
        });

    } else {
        response.status(400);
        response.json({
            ok: false,
            results: 'Incomplete memory.',
        });
    }
});

service.patch('/questions/:id', (request, response) => {
    const parameters = [
        request.body.question,
        request.body.answer1,
        request.body.answer2,
        request.body.answer3,
        request.body.answer4,
        request.body.correct_ans,
        parseInt(request.params.id),
    ];

    const query = 'UPDATE project2 SET question = ?, answer1 = ?, answer2 = ?, answer3 = ?, answer4 = ?, correct_ans = ? WHERE id = ?';
    connection.query(query, parameters, (error, result) => {
        if (error) {
            response.status(404);
            response.json({
                ok: false,
                results: error.message,
            });
        } else {
            response.json({
                ok: true,
            });
        }
    });
});

// recover deleted entry
service.patch('/questions/recover/:id', (request, response) => {
    const parameters = [parseInt(request.params.id)];

    const query = 'UPDATE project2 SET is_deleted = 0 WHERE id = ?';
    connection.query(query, parameters, (error, result) => {
        if (error) {
            response.status(404);
            response.json({
                ok: false,
                results: error.message,
            });
        } else {
            response.json({
                ok: true,
            });
        }
    });
});

service.delete('/questions/:id', (request, response) => {
    const parameters = [parseInt(request.params.id)];

    const query = 'UPDATE project2 SET is_deleted = 1 WHERE id = ?';
    connection.query(query, parameters, (error, result) => {
        if (error) {
            response.status(404);
            response.json({
                ok: false,
                results: error.message,
            });
        } else {
            response.json({
                ok: true,
            });
        }
    });
});

// deletes all values in the db
service.delete('/reset', (request, response) => {
    const query = 'UPDATE project2 SET is_deleted = 1';
    connection.query(query, (error, result) => {
        if (error) {
            console.error(error);
            response.status(404);
            response.json({
                ok: false,
                results: error.message,
            });
        } else {
            response.json({
                ok: true,
            });
        }
    });
});

// deletes all values in the db
service.delete('/hardreset', (request, response) => {
    const query = 'DELETE FROM project2';
    connection.query(query, (error, result) => {
        if (error) {
            console.error(error);
            response.status(404);
            response.json({
                ok: false,
                results: error.message,
            });
        } else {
            response.json({
                ok: true,
            });
        }
    });
});



// connection.end(); // connection stays open as long as service is running