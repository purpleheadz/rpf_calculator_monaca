"use strict";

/*汎用スタックコンストラクタ*/
function Stack() { 
	this.__a = new Array();

	Stack.prototype.push = function(o) {
		this.__a.push(o);
	} 

	Stack.prototype.pop = function() {
		if( this.__a.length <= 0 ) {
			return null;
		}
		return this.__a.pop(); 
	} 

	Stack.prototype.size = function() {
		return this.__a.length;
	} 

	Stack.prototype.toString = function() {
		return '[' + this.__a.join(',') + ']';
	}

	Stack.prototype.last = function() {
		return (this.__a.length <= 0 ? null : this.__a[this.__a.length - 1]);
	}

	Stack.prototype.first = function() {
		return (this.__a.length <= 0 ? null : this.__a[0]);
	}
}; 

/*各種演算関数*/
function add(num1, num2) {
	return num2 + num1;
};

function sub(num1, num2) {
	return num2 - num1;
};

function mul(num1, num2) {
	return num2 * num1;
};

function dev(num1, num2) {
	return num2 / num1;
};


/*逆ポーランド記法計算機コンストラクタ*/
function RpfCaluculator() {
	//演算関数
	this.operator = null;

	//数値スタック
	this.operand_stack = new Stack();

	//計算過程ログ
	this.process_buffer = '';

	//数値判定メソッド
	RpfCaluculator.prototype.isOperand = function(token) {
		return (token.match(/^[\d\.]+$/) != null);
	}

	//計算メソッド
	RpfCaluculator.prototype.calculate = function(rpf) {
		this.process_buffer = '';
		rpf.split(' ').forEach(function(token) {
			if(token.trim().length <= 0) {
				return ;
			}
	
			if (this.isOperand(token)) {
				this.operand_stack.push(parseFloat(token));
			} else {
				switch (token) { 
				case "+" :
					this.operator = add;
					break;
				case "-" :
					this.operator = sub;
					break;
				case "*" :
					this.operator = mul;
					break;
				case "/" :
					this.operator = dev;
					break;
				default:
				}
				var v1 = this.operand_stack.pop();
				var v2 = this.operand_stack.pop();
				var answer = this.operator(v1, v2);

				this.operand_stack.push(answer);
				this.process_buffer += (v2 + ' ' + token + ' ' + v1 + ' = ' + answer + '\n');
			};
		}, this);

		return this.operand_stack.pop()
	}	

};



/*逆ポーランド記法生成機コンストラクタ*/
function RpfGenerator() {
	//演算子スタック
	this.operator_stack = new Stack();

	//数値判定メソッド
	RpfGenerator.prototype.isOperand = function(token) {
		return (token.match(/^[\d\.]+$/) != null);
	}

	//演算子優先度判定メソッド
	RpfGenerator.prototype.priority = function(token) {
		switch (token) {
		case "+" :
			return 1;
			break;
		case "-" :
			return 1;
			break;
		case "*" :
			return 2;
			break;
		case "/" :
			return 2;
			break;
		default:
		return 0;
		}
	}

	//文字列分割メソッド
	RpfGenerator.prototype.tokenize = function(text) {
		var tokens = [];
		var buffer = '';
		text.split('').forEach(function(c) {
			if (this.isOperand(c)) {
				buffer += c;
			} else {
				if (buffer.length > 0) {
					tokens.push(buffer);
					buffer = '';
				}
				if (c.match(/[\+\-\*\/()]/) != null) {
					tokens.push(c);
				}
			}
		}, this);

		if (buffer.length > 0) {
			tokens.push(buffer);
		}

		return tokens
	}

	//逆ポーランド記法生成メソッド
	RpfGenerator.prototype.generate = function(text) {
		var buffer = '';

		this.tokenize(text).forEach(function(token) {
			if (this.isOperand(token)) {
				buffer += (token + ' ');
			} else if (token == '(') {
				this.operator_stack.push(token);
			} else if (token == ')') {
				while (this.operator_stack.last() != '(' && this.operator_stack.last() != null){
					buffer += (this.operator_stack.pop() + ' ');
				}
				this.operator_stack.pop();
			} else if (token.match(/[\+\-\*\/]/) != null) {
				while (this.operator_stack.size() > 0 && this.priority(this.operator_stack.last()) >= this.priority(token)) {
					buffer += (this.operator_stack.pop() + " ")
				}
				this.operator_stack.push(token);
			} else {
			}
		}, this);
		while (this.operator_stack.size() > 0){
			buffer += (this.operator_stack.pop() + ' ');
		}

		return buffer;
	}

};



/*angularjsコントローラ定義*/
angular.module('Calculator', ['ui.bootstrap'])
.controller('MainController', ['$scope', function ($scope) {
	$scope.rpf_generator = new RpfGenerator();
	$scope.rpf_calculator = new RpfCaluculator();

	$scope.mathematical_formula = '';

	$scope.onclick = function(btn) {
		console.log(btn.target);
		switch (btn.target.value) {
			case "D":
				$scope.mathematical_formula = $scope.mathematical_formula.substr(0, ($scope.mathematical_formula.length-1));
			break;
			case "C":
				$scope.mathematical_formula = '';
			break;
			default:
				$scope.mathematical_formula += btn.target.value;
		}
	};
}]);
