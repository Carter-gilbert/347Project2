const express = require('express');
const fs = require('fs');
const mysql = require('mysql');

const json = fs.readFileSync('credentials.json', 'utf8');
const credentials = JSON.parse(json);
const connection = mysql.createConnection(credentials);

const service = express();
service.use(express.json());


connection.connect(error => {
    if (error) {
        console.error(error);
        process.exit(1);
    }
});


const port = 8443;
service.listen(port, () => {
    console.log(`We're live on port ${port}!`);
});


const selectQuery = 'SELECT * FROM project2';
connection.query(selectQuery, (error, rows) => {
    if (error) {
        console.error(error);
    } else {
        console.log(rows);
    }
});

// const insertQuery = 'INSERT INTO project2(question, answer1, answer2, answer3, answer4, correct_ans) VALUES (?, ?, ?, ?, ?, ?)';
// const parameters = ["What is 2 + 2", "1", "2", "3", "4", 4];
// connection.query(insertQuery, parameters, (error, result) => {
//     if (error) {
//         console.error(error);
//     } else {
//         console.log(result);
//     }
// });

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
// this just gets the json of the vars from rowToQuestion so question, the ans, and correct_ans
connection.query('SELECT * FROM project2', (error, rows) => {
    if (error) {
        console.error(error);
    } else {
        const question = rows.map(rowToQuestion);
        console.log(question);
    }
});

service.get('/questions/:id', (request, response) => {
    const parameters = [
        parseInt(request.params.question),
        parseInt(request.params.correct_ans),
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

service.post('/questions', (request, response) => {
    const parameters = [
        request.body.year,
        request.body.month,
        request.body.day,
        request.body.entry,
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
                results: 'It worked!',
            });
        }
    });
});



// connection.end(); // connection stays open as long as service is running