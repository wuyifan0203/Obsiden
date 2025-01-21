# WebGLContext Lost and Restore

## WebGLContext 简介

WebGLContext（即 WebGL 上下文）是浏览器在使用 GPU（图形处理器）进行绘制时所依赖的一个**渲染上下文**。可以理解为浏览器与显卡之间的一座“桥梁”，通过它才能将 JavaScript 发出的绘制命令真正地在 GPU 中执行。一个页面通常会通过 `<canvas>` 标签获取到这个上下文，然后使用相关的 WebGL API 调用 GPU 资源。

---

## Context 丢失原因

以下几个常见原因:

1. **GPU 资源紧张或显存不足**
   - 浏览器或操作系统在检测到显存压力时，可能回收不活跃或占用过大的 GPU 上下文。
   - 移动端或多网页同开时尤为明显。
2. **浏览器/显卡驱动异常**
   - 显卡驱动崩溃、重启，或浏览器自身出现故障，都可能造成上下文被强制中断。
   - 在这种情况下，浏览器为了防止崩溃会直接丢失/回收 WebGL 上下文。
3. **页面占用大量 GPU 资源**  
   - 过多的纹理、离屏渲染目标（Framebuffer）、或同时创建了多份 WebGLContext。  
   - 浏览器为了自保（防止死锁或卡死），会选择丢失部分上下文。
4. **用户操作或系统层面切换**  
   - 某些情境：浏览器 Tab 长时间后台、系统切换 GPU（集显/独显自动切换）等，可能触发上下文丢失。

---

## Context 丢失的影响

当 WebGL Context 丢失时，实际上**GPU 中分配给当前渲染上下文的所有资源都会被释放**，

这些资源包括：
- 纹理（Textures）
- 缓冲区对象（Buffer Objects）
- 帧缓冲区（Framebuffer）
- 渲染缓冲区（Renderbuffer）
- 着色器、程序对象（Shader / Program）

一旦出现 webglcontextlost 事件，**在没有被恢复（restore）之前，所有的 WebGL 操作将会失败**，也无法提交新的绘制指令给 GPU。WebGL 会暂时处于“不可用”状态。

---

## 如何避免（或尽量降低）发生

完全避免 Context 丢失并不现实，但可以通过以下手段来降低丢失的概率：

1. **合理分配 GPU 资源**  
    - 纹理大小要适量，尤其在移动端，避免使用超大纹理。
    - 动态创建和销毁 WebGL 资源时，及时释放不再使用的缓冲区或纹理。
2. **减少不必要的离屏渲染**  
离屏渲染（Framebuffer）通常会占用额外的显存，只有在确实需要后处理或特效时才使用。
3. **控制同页面内的多个 WebGL Context 数量**  
如果可能，尽量使用单一或少量 WebGL 上下文，避免同一页面频繁地 new WebGL contexts。
4. **分配内存要谨慎**
尽量确保所有数据都可控，如纹理数据、模型数据等都进行必要的压缩或者分块加载，不一次性给 GPU “爆量”传输。

---

## Context 丢失后恢复的方式

1. **事件监听**：`webglcontextlost` 和 `webglcontextrestored`  
    - 在 `webglcontextlost` 中使用 `event.preventDefault()`，来阻止浏览器默认行为（默认情况下浏览器可能直接停止试图恢复这个上下文）。
    - **不要继续调用 WebGL API** 以免报错。
2. **等待浏览器触发`webglcontextrestored`事件**
    - 一旦收到，就重新进行所有依赖 GPU 资源的初始化过程，比如重新上传纹理、重新初始化着色器等。

> **在使用three发生 WebGLContext Lost 事件，恢复时否还需要调用dispose()方法？**  
>  对于 GPU，已经被系统回收了，不用调用 `dispose()`。  
> 对于Three，根据根据自身需求，如果需要复用，就不用调用。Three 会察觉“这些 GPU 资源还没上传”，就会再次调用内部的 initTexture(), initMaterial(), initGeometry() 等逻辑，将对应的数据（JS 端）上传到 GPU 中，重新编译着色器等。如果需要重新创建，则需要再 `remove()` 后 则需要调用 `dispose()`。以便让 JS 侧引用尽早释放，避免不必要的内存占用。

> **为什么不在 `webglcontextlost` 回调中就销毁或重建？**  
> 在 `webglcontextlost` 回调里，只是得知上下文丢失了。如果此时新建上下文，那它也拿不到可用的 WebGL context。