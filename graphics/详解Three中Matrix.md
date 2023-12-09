
# Threejs 中各种矩阵的详解

## Object3D.matrix (模型矩阵)
物体以自身为为原点建立坐标系，经过多次模型变换的结果为模型矩阵，常见的模型变换操作
例如平移、缩放、旋转、镜像等。

## Object3D.matrixWorld (世界矩阵)
世界矩阵是模型矩阵和父物体世界矩阵的乘积的结果。一般用于计算物体顶点在世界坐标系中的位置。

```javascript
// 例如模型object上的任意顶点为(x,y,z)
const vertexInWorld = new Vector3(x,y,z).applyMatrix4(object.matrixWorld);
// 求出的结果为世界坐标系下的顶点位置
```

## Object3D.matrixWorldInverse (世界矩阵的逆)
世界矩阵的逆矩阵，用于计算世界坐标系下任意顶点在模型坐标系中的位置。与上面的例子作用相反，是将世界坐标系的顶点转化为模型坐标系下的顶点位置。
一般用于计算物体与物体之间的坐标系转换。

```javascript
// 现有模型object1和模型object2
// 模型object1上的任意顶点为(x,y,z)
// 求出该点在模型object2的坐标系中的位置
const vertex = new Vector3(x,y,z);
vertex.applyMatrix4(object1.matrixWorld); // 转化为世界坐标系
vertex.applyMatrix4(object2.matrixWorldInverse) // 转化为模型object2坐标系下的顶点位置
```



