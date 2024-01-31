// DOM Elements
const elExpression = document.querySelector('.expression');
const elOptions = document.querySelector('.options');
const elAnswer = document.querySelector('.answer');
const elPoints = document.querySelector('.points span');
const elTime = document.querySelector('.time span');


// Global Variables
const operators = ['*', '/', '+', '-'];
let numOperators = 2, expression, result, answer, options, points = 0, timeToAnswer = null, clock = 10;


// Function to get a random operator from an array
function getRandomOperator(arr) {
    const index = Math.floor(Math.random() * arr.length);
    return arr[index];
}

// Function to get a random integer between 1 and 10
function getRandomNumber() {
    return Math.floor(Math.random() * 10) + 1;
}

// Function to get a random expression with a specified number of operators
function getRandomExpression(numOperators) {
    let expression = [];

    for (let i = 0; i < numOperators; i++) {
        expression.push(
            getRandomNumber(),
            getRandomOperator(operators),
        );

        if (i === numOperators - 1) {
            expression.push(getRandomNumber());
        }
    }

    return expression;
}

// Function to join elements of an array with a space
function joinElements(arr) {
    return arr.join(' ');
}

// Function to get all operators in the expression
function getAllOperators(expression) {
    return expression.filter(el => operators.some(op => op === el)).join(' ');
}

// Function to get the expression with operators replaced by '?'
function getHiddenExpression(expression) {
    const hiddenExpression = expression.map(element =>
        operators.includes(element) ? '?' : element
    );
    return joinElements(hiddenExpression);
}

// Function to find the next operator to be calculated
function findNextOperator(expression) {
    if (expression.some(e => e === '^')) {
        return expression.findIndex(e => e === '^');
    }

    if (expression.some(e => e === '*' || e === '/')) {
        return expression.findIndex(e => e === '*' || e === '/');
    }

    if (expression.some(e => e === '+' || e === '-')) {
        return expression.findIndex(e => e === '+' || e === '-');
    }

    return -1;
}

// Function to calculate a specific operator
function resolveOperator(x, operator, y) {
    if (!x || !operator || !y) return null;

    switch (operator) {
        case '^':
            return Math.pow(x, y);
        case '*':
            return x * y;
        case '/':
            return x / y;
        case '+':
            return x + y;
        case '-':
            return x - y;
        default:
            return NaN; // Handle unsupported operators
    }
}

// Function to resolve a part of the expression
function resolvePartial(expression) {
    let i = findNextOperator(expression);
    let partial = resolveOperator(expression[i - 1], expression[i], expression[i + 1]);
    expression[i - 1] = partial;
    expression[i] = expression[i + 1] = null;
    return expression.filter(j => j !== null);
}

// Function to resolve the complete expression
function resolveExpression(expression) {
    let result = [...expression];

    while (result.length > 1) {
        result = resolvePartial(result);
    }

    return result[0] ?? 0;
}

// Function to get a random option
function getOption(quantity) {
    let randomOperators = [];
    for (let i = 0; i < quantity; i++) {
        randomOperators.push(getRandomOperator(operators));
    }

    return randomOperators.join(' ');
}

// Function to get all options
function getAllOptions(numOperators, answer) {
    let options = [];
    options.push(answer);

    while (options.length < 4) {
        let fakeOption = getOption(numOperators);

        if (!options.some(o => o === fakeOption)) {
            options.push(fakeOption);
        }
    }
    return randomSort(options);
}

// Function to shuffle an array randomly
function randomSort(arr) {
    const shuffledArray = arr.slice();

    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }

    return shuffledArray;
}

// Function to create a button element with an option for the expression
function createElOption(option) {
    let elOption = document.createElement('button');
    elOption.id = option;
    elOption.textContent = option;
    elOption.addEventListener('click', () => checkOption(option));
    return elOption;
}

// Function to check the selected option against the correct answer
function checkOption(option) {
    clearInterval(timeToAnswer);

    elAnswer.classList.remove('hide');

    if (option === answer) {
        elAnswer.classList.add('right');
        elAnswer.classList.remove('wrong');
        points += numOperators * 100;
    } else {
        elAnswer.classList.add('wrong');
        elAnswer.classList.remove('right');
        points -= numOperators * 25;
    }

    elPoints.textContent = points;
    const optionsList = elOptions.querySelectorAll('button');
    optionsList.forEach(option => option.disabled = true);

    setTimeout(refreshExpression, 2500);
}

// Function to refresh the expression
function refreshExpression() {
    clearInterval(timeToAnswer);
    clock = 10;

    expression = result = answer = options = null;

    elOptions.innerHTML = '';
    elAnswer.classList.add('hide');

    while (!Number.isInteger(result)) {
        expression = getRandomExpression(numOperators);
        result = Number.parseFloat(resolveExpression(expression));
    }

    answer = getAllOperators(expression);
    options = getAllOptions(numOperators, answer);

    elExpression.textContent = `${getHiddenExpression(expression)} = ${result}`;
    options.forEach(op => {
        elOptions.append(createElOption(op));
    });

    elAnswer.textContent = `${joinElements(expression)}`;

    timeToAnswer = setInterval(updateClock, 1000);
}

function updateClock() {
    if (clock > 0) {
        clock--;
        elTime.innerText = clock;
    } else{
        timeUp();
    }
}

function timeUp() {
    points -= numOperators * 50;
    elPoints.textContent = points;
    
    clock = 10;
    elTime.innerText = clock;
    
    refreshExpression();
}

// Initial expression refresh
refreshExpression();

