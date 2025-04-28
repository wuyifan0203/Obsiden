# Vue

## 生命周期
```js
function setup(){
    beforeCreate();
    // 初始化选项式api
    created()
    if(!existPrecompiledTemplate){
        compile()
    }
    beforeMount()
    // 初始渲染，创建和插入DOM节点
    mounted()
    // 数据更新
    beforeUpdate()
    // 数据更新
    updated()
    // 卸载组件
    beforeUnmount()
    unmounted()
}
```

## 响应式原理
effect > track > trigger > effect
组件使用响应式变量时，会生成effect，effect会触发get操作，会收集依赖。当变量发生变化时，会触发set操作，会触发依赖的effect。

### effect
```js
let activeEffect = null
export function effect(callback) {
    activeEffect = callback
    callback()
    activeEffect = null
}
```
### track
```js
const targetMap = new WeakMap();
function track(target, key) {
    if (!activeEffect) return;
    const depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, (dep = new Set()));
    }
    if (!dep.has(activeEffect)) {
        dep.add(activeEffect);
    }
}

// handler get
const handler = {
    get(target, key, receiver) {
        const result = Reflect.get(target, key, receiver);
        track(target, key);
        return result;
    },
}
```
### trigger
```js
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    if (!depsMap) return;
    const dep = depsMap.get(key);
    if (!dep) return;
    dep.forEach((effect) => {
        effect();
    });
}
// handler set
const handler = {
    set(target, key, value, receiver) {
        const result = Reflect.set(target, key, value, receiver);
        trigger(target, key);
        return result;
    },
}
```

## 组件的通信方式

## nextTick实现原理
Vue 在数据变化时不会立即更新 DOM，而是将变更缓冲到异步队列中，在下一个事件循环中批量更新。这种机制减少了重复渲染，但导致数据变化后 ​​无法立即获取更新后的 DOM 状态​​

通过 nextTick 延迟回调的执行，确保代码在 ​​DOM 更新循环结束后运行​​，从而访问最新的 DOM
## keep-alive实现原理

## teleport实现原理
