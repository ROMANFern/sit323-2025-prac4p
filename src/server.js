const express = require('express');
const { add, subtract, multiply, divide } = require('./calculator');
const winston = require('winston');
const app = express();

// Winston Logger Configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'calculator.log' })
    ]
});

// Middleware to log all requests
app.use((req, res, next) => {
    logger.info({
        method: req.method,
        url: req.url,
        headers: req.headers
    });
    next();
});

// Route to handle arithmetic operations
const calculate = (req, res, operation) => {
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);

    if (isNaN(num1) || isNaN(num2)) {
        res.status(400).send({ error: "Invalid input. Provide valid numbers." });
        return;
    }

    try {
        let result;
        switch (operation) {
            case 'add':
                result = add(num1, num2);
                break;
            case 'subtract':
                result = subtract(num1, num2);
                break;
            case 'multiply':
                result = multiply(num1, num2);
                break;
            case 'divide':
                result = divide(num1, num2);
                break;
            default:
                res.status(400).send({ error: "Invalid operation." });
                return;
        }
        res.status(200).send({ result });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// API Endpoints
app.get('/add', (req, res) => calculate(req, res, 'add'));
app.get('/subtract', (req, res) => calculate(req, res, 'subtract'));
app.get('/multiply', (req, res) => calculate(req, res, 'multiply'));
app.get('/divide', (req, res) => calculate(req, res, 'divide'));

// Error handling for invalid routes
app.use((req, res) => {
    res.status(404).send({ error: "Endpoint not found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
