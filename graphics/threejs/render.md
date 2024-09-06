 ## 初始化

 1. 在 new Render的时候，先创建canvas dom元素，获取上下文，
 2. 对内部一些控制类做初始化
    - Extensions:根据当前环境，生成当前环境所支持的扩展map
    - Capabilities:根据环境获取当前环境的极限值，例如最大各项异性过滤值，最大纹理数，根据映射转化为WebGl的识别的状态
    - info:记录当前渲染器的状态，例如渲染的帧数，渲染的材质数，渲染的几何体数
    - properties:记录当前渲染器的属性，例如是否开启抗锯齿，是否开启阴影
    - state:记录当前渲染器的状态，用来管理上下文的状态，例如当前绑定的纹理，是否开启深度测试
    - shadowMap:记录当前渲染器的阴影状态，例如是否开启阴影，阴影的分辨率，阴影的偏移量
    - attributes: 用来存储管理所有使用到的buffer数据
    - background: 用来控制场景的背景
3. 对一些方法属性做初始化，sortObject是否开启，透明物体的排序方法，非透明物体的排序方法
   
## render
1. 更新场景的世界矩阵
2. 更新相机的世界矩阵
3. 执行场景渲染前的回调(onBeforeRender)
4. 以场景作为key去StateMap拿取当前渲染状态，没有则新建初始化，推到渲染栈里
5. 计算VP矩阵，生成视椎体，为视椎体剔除做准备
6. 以场景作为key去RenderList获取当前渲染列表，没有则初始化，推到渲染列表栈里
7. 将物体投影到相机坐标系中，其中内部做了很多事
    1. 先根据物体visible进行剔除  ,再根据物体Layer剔除
    2. 对不同类型物体做差异化处理，group对整体的renderOrder赋值，Light则推到当前的state，根据是否产生阴影，创建ShadowMap，Mesh，Line，Points会视椎体剔除，在根据material的visible做剔除
    3. Mesh，Line，Points计算外接球球心的深度Z值，传递给RenderList
    4. 递归遍历
  8. 