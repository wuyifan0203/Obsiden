```
let promise = new Promise(function(resolve, reject) {
	// executor
});

```

当promise执行完，获得了结果
如果没有报错执行 resolve ，有报错执行 reject

promise 内部有一个属性state默认为“pending”，属性result为undefined

当调用resolve时，状态为 “fulfilled”，result变为value

当调用reject时，state为“rejected”，result变为Error

then，catch，finally用来注册后续执行函数

then也接受两个函数，一个resolve，一个reject

catch只对Error感兴趣


