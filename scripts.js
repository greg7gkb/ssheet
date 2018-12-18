
console.log('gkb ftw');

const rows = 5;
const cols = 4;

var cells = new Array(rows);
for (var i = 0; i < cells.length; i++) {
	cells[i] = new Array(cols);
	for (var j = 0; j < cells[0].length; j++) {
		cells[i][j] = {}
		cells[i][j]['id'] = `${i},${j}`;
	}
}
console.log(cells);

document.body.appendChild(createTable());

//-------------------------------------------------------------------------------------------------
// function defs

function onCellChanged(cell, row, col) {
	return function() {
		console.log(`Cell [${row},${col}] changed to: ${cell.value}`);

		if (cell.value.startsWith("=")) {
			evaluateFunction(cell, row, col);
		}
	}
}

function evaluateFunction(cell, row, col) {
	var formula = `${cell.value.substring(1)}`;
	console.log(`Parsing function: ${formula}`);
	cells[row][col]['formula'] = formula;

	cells[row][col]['tokens'] = tokenize(formula);
	console.log(`Tokens: ${cells[row][col]['tokens']}`);
}

function addHeaderLabels(table) {
    var tr = document.createElement('tr');
	tr.appendChild(document.createElement('td'))
	for (var col = 0; col < cols; col++){
	    var td = document.createElement('td');
	    var label = document.createElement('p');
	    label.innerText = "Col " + String.fromCharCode(col + 65); // Offset from 'A'
	    td.appendChild(label);
		tr.appendChild(td)
	}
	table.appendChild(tr);
}

function addRowLabel(tr, row) {
    var td = document.createElement('td');
    var label = document.createElement('p');
    label.innerText = `Row ${row}`;
    td.appendChild(label);
	tr.appendChild(td)
}

function createTable() {
	var table = document.createElement('table');
	addHeaderLabels(table);

	for (var row = 0; row < rows; row++){
	    var tr = document.createElement('tr');
	    addRowLabel(tr, row);

		for (var col = 0; col < cols; col++){
			console.log(`Creating cell ${row},${col}`)
		    var td = document.createElement('td');

		    var input = document.createElement("input");
		    input.type = "text"
		    input.addEventListener('change', onCellChanged(input, row, col));

		    td.appendChild(input);
		    tr.appendChild(td);
		}

	    table.appendChild(tr);
	}

	return table;
}

//-------------------------------------------------------------------------------------------------
// Based on tokenizer from:
// https://medium.freecodecamp.org/how-to-build-a-math-expression-tokenizer-using-javascript-3638d4e5fbe9

function Token(type, value) {
	this.type = type;
	this.value = value;
}

function isComma(ch) {
	return /,/.test(ch);
}

function isDigit(ch) {
	return /\d/.test(ch);
}

function isLetter(ch) {
	return /[a-z]/i.test(ch);
}

function isOperator(ch) {
	return /\+|-|\*|\/|\^/.test(ch);
}

function isLeftParenthesis(ch) {
	return /\(/.test(ch);
}

function isRightParenthesis(ch) {
	return /\)/.test(ch);
}

function tokenize(str) {
	str.replace(/\s+/g, "");
	str=str.split("");

	var result=[];
	var letterBuffer=[];
	var numberBuffer=[];

	str.forEach(function (char, idx) {
		if(isDigit(char)) {
			if (letterBuffer.length) {
				letterBuffer.push(char)
			}
			else {
				numberBuffer.push(char);
			}
		} else if(char==".") {
			numberBuffer.push(char);
		} else if (isLetter(char)) {
			if(numberBuffer.length) {
				emptyNumberBufferAsLiteral();
				result.push(new Token("Operator", "*"));
			}
			letterBuffer.push(char);
		} else if (isOperator(char)) {
			emptyNumberBufferAsLiteral();
			emptyLetterBuffer();
			result.push(new Token("Operator", char));
		} else if (isLeftParenthesis(char)) {
			if(letterBuffer.length) {
				result.push(new Token("Function", letterBuffer.join("")));
				letterBuffer=[];
			} else if(numberBuffer.length) {
				emptyNumberBufferAsLiteral();
				result.push(new Token("Operator", "*"));
			}
			result.push(new Token("Left Parenthesis", char));
		} else if (isRightParenthesis(char)) {
			emptyLetterBuffer();
			emptyNumberBufferAsLiteral();
			result.push(new Token("Right Parenthesis", char));
		} else if (isComma(char)) {
			emptyNumberBufferAsLiteral();
			emptyLetterBuffer();
			result.push(new Token("Function Argument Separator", char));
		}
	});
	if (numberBuffer.length) {
		emptyNumberBufferAsLiteral();
	}
	if(letterBuffer.length) {
		emptyLetterBuffer();
	}
	return result;

	function emptyLetterBuffer() {
		var bufferString = letterBuffer.join("");
		if (bufferString.match(/\d/)) {
			result.push(new Token("Reference", bufferString));
		}
		else {
			var l = letterBuffer.length;
			for (var i = 0; i < l; i++) {
				result.push(new Token("Variable", letterBuffer[i]));
	          	if(i< l-1) { //there are more Variables left
	          		result.push(new Token("Operator", "*"));
	          	}
	      	}
	    }
      	letterBuffer = [];
  	}

  	function emptyNumberBufferAsLiteral() {
  		if(numberBuffer.length) {
  			result.push(new Token("Literal", numberBuffer.join("")));
  			numberBuffer=[];
  		}
  	}
}
