## generator函数

generator函数是使用一种特殊的结构 `function*`  生成的函数，该函数调用时会返回一个 “generator object”

```javascript
function* generateSequence() { 
	yield 1; 
	yield 2; 
	return 3; 
} 
// "generator function" 创建了一个 "generator object" 
let g = generateSequence(); 
alert(g); // [object Generator]；
g.next() // {value: 1, done: false}
g.next() // {value: 2, done: false}
g.next() // {value: 3, done: true}
g.next() // {value: undefined, done: true}
```

使用next()来产出yield的值，会返回一个对象包含`value`和`done`,其中value是yield返回值，done只有在返回最后一项时变成true

## generator 是可迭代的

可以使用for of进行迭代，当done为true时会忽略当前value值
```javascript
for(let value of generator) { 
	alert(value); // 1，然后是 2 ,没有3
}
```

## generator 组合

在generator函数中可以使用`yield*`,进行组合
```javascript
function* generateSequence(start, end) { 
	for (let i = start; i <= end; i++) yield i;
}

function* generatePasswordCodes() { 
	// 0..9 
	yield* generateSequence(48, 57); 
	// A..Z 
	yield* generateSequence(65, 90); 
	// a..z 
	yield* generateSequence(97, 122); 
}

let str = '';
for(let code of generatePasswordCodes()) { 
	str += String.fromCharCode(code); 
} 
alert(str); // 0..9A..Za..z
```

## yield 是双通道

不仅可以把值返回出去，还可以将值传入generator

调用generator.next(arg),最后arg变成返回的结果
```javascript
function* gen() { 
	let result = yield "2 + 2 = ?"; // 向外部代码传递一个问题并等待答案 
	alert(result);  // 4
} 
let generator = gen();
let question = generator.next().value; // <-- yield 返回的 value 
alert(question); // "2 + 2 = ?"
generator.next(4); // --> 将结果传递到 generator 中
/// 最后输出 "2 + 2 = ?" “4”
```

## generator.throw

使用yield向generator中传递一个错误，需要使用generator.throw
```javascript
function* gen() { 
	try { 
		let result = yield "2 + 2 = ?"; // (1) 
		alert("The execution does not reach here, because the exception is thrown above"); 
	} catch(e) { 
		alert(e); // 显示这个 error 
	} 
} 
let generator = gen(); 
let question = generator.next().value; 
generator.throw(new Error("The answer is not found in my database")); // (2)
```

## generator.return

当已经获取到想要的值，这时候需要停止它

```javascript
function* gen() { 
	yield 1; 
	yield 2; 
	yield 3; 
} 
const g = gen(); 
g.next(); // { value: 1, done: false } 
g.return('foo'); // { value: "foo", done: true } 
g.next(); // { value: undefined, done: true }😀
```