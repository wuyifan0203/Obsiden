
## 概念


keep-alive 是 vue 的内置组件，当它包裹动态组件时，会缓存不活动的组件实例，而不是销毁它们。(缓存的是 component Instance)
keep-alive 是一个抽象组件：它自身不会渲染成一个 DOM 元素，也不会出现在父组件中。
## 作用


保存页面/组件的状态，避免组件反复创建和渲染，有效提升系统性能。

## 原理

 在 created 函数调用时将需要缓存的 instance 保存在 this.cache 中，在 render（页面渲染） 时，如果 instance 的 name 符合缓存条件（可以用 include 以及 exclude 控制），则会从 this.cache 中取出之前缓存的 instance 进行渲染。
## Props

- include?: MatchPattern  如果指定，则只有与 `include` 名称，匹配的组件才会被缓存
- exclude?: MatchPattern 任何名称与 `exclude`，匹配的组件都不会被缓存。
- max?: number | string 最多可以缓存多少组件实例。

## 生命周期

- **activated** ：在组件挂载时也会调用
- **deactivated**：在组件卸载时也会调用

## 应用

- 在动态组件中的应用

```vue
<keep-alive :include="whiteList" :exclude="blackList" :max="amount"> 
	<component :is="currentComponent">
</component> </keep-alive>
```
- 在vue-router中的应用

```vue
<keep-alive :include="whiteList" :exclude="blackList" :max="amount">
  <router-view></router-view>
</keep-alive>
```