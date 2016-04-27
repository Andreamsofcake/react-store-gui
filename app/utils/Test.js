export function foo() {
	console.log('foo?');
	bar();
}

export function bar() {
	console.error('BAR BAR BAR');
}