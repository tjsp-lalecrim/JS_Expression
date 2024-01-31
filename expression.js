// DOM Elements
const elements = {
    expression: document.querySelector('.expression'),
    options: document.querySelector('.options'),
    answer: document.querySelector('.answer'),
    points: document.querySelector('.points span'),
    time: document.querySelector('.time span')
};

// Constants
const OPERATORS = ['*', '/', '+', '-'];
const NUM_OPERATORS = 2;
const TIMEOUT_DURATION = 2500;
const CLOCK_INTERVAL = 1000;
const ANSWER_POINTS = {
    correct: NUM_OPERATORS * 100,
    incorrect: NUM_OPERATORS * 25,
    timeUp: NUM_OPERATORS * 50
};

let rightAnswer = null;
let points = 0;
let clock = 10;
let timeToAnswer = null;

// Utility Functions
const getRandomOperator = arr => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = () => Math.floor(Math.random() * 10) + 1;
const joinElements = arr => arr.join(' ');
const randomSort = arr => arr.slice().sort(() => Math.random() - 0.5);

// Expression Functions
const getRandomExpression = numOperators => {
    const expression = [];
    for (let i = 0; i < numOperators; i++) {
        expression.push(getRandomNumber(), getRandomOperator(OPERATORS));
    }
    expression.push(getRandomNumber());
    return expression;
};

const resolveExpression = expression => {
    let result = [...expression];
    while (result.length > 1) {
        const index = result.findIndex(e => OPERATORS.includes(e));
        const partial = resolveOperator(result[index - 1], result[index], result[index + 1]);
        result.splice(index - 1, 3, partial);
    }
    return result[0] ?? 0;
};

const resolveOperator = (x, operator, y) => {
    switch (operator) {
        case '^': return Math.pow(x, y);
        case '*': return x * y;
        case '/': return x / y;
        case '+': return x + y;
        case '-': return x - y;
        default: return NaN;
    }
};

// Option Functions
const getOption = quantity => Array.from({ length: quantity }, () => getRandomOperator(OPERATORS)).join(' ');

const getAllOptions = (numOperators, answer) => {
    const options = [answer];
    while (options.length < 4) {
        const fakeOption = getOption(numOperators);
        if (!options.includes(fakeOption)) {
            options.push(fakeOption);
        }
    }
    return randomSort(options);
};

// Event Handlers
const checkOption = option => {
    clearInterval(timeToAnswer);
    elements.answer.classList.remove('hide');
    if (option === rightAnswer) {
        elements.answer.classList.add('right');
        elements.answer.classList.remove('wrong');
        points += ANSWER_POINTS.correct;
    } else {
        elements.answer.classList.add('wrong');
        elements.answer.classList.remove('right');
        points -= ANSWER_POINTS.incorrect;
    }
    elements.points.textContent = points;
    disableOptions();
    setTimeout(refreshExpression, TIMEOUT_DURATION);
};

const timeUp = () => {
    points -= ANSWER_POINTS.timeUp;
    elements.points.textContent = points;
    clock = 10;
    elements.time.innerText = clock;
    refreshExpression();
};

// Timer Functions
const updateClock = () => {
    if (clock > 0) {
        clock--;
        elements.time.innerText = clock;
    } else {
        timeUp();
    }
};

// Initialization
const createElOption = option => {
    const elOption = document.createElement('button');
    elOption.id = option;
    elOption.textContent = option;
    elOption.addEventListener('click', () => checkOption(option));
    return elOption;
};

const disableOptions = () => {
    const optionsList = elements.options.querySelectorAll('button');
    optionsList.forEach(option => option.disabled = true);
};

const refreshExpression = () => {
    clearInterval(timeToAnswer);
    clock = 10;
    elements.time.innerText = clock;
    elements.options.innerHTML = '';
    elements.answer.classList.add('hide');

    let expression, result, answer, options;

    do {
        expression = getRandomExpression(NUM_OPERATORS);
        result = resolveExpression(expression);
    } while (!Number.isInteger(result));

    rightAnswer = expression.filter(el => OPERATORS.includes(el)).join(' ');
    options = getAllOptions(NUM_OPERATORS, rightAnswer);

    elements.expression.textContent = `${expression.join(' ')} = ${result}`;
    options.forEach(op => {
        elements.options.append(createElOption(op));
    });
    elements.answer.textContent = expression.join(' ');

    timeToAnswer = setInterval(updateClock, CLOCK_INTERVAL);
};

// Initial expression refresh
refreshExpression();
