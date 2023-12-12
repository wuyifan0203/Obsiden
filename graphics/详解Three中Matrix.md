<!--
 * @Date: 2023-12-08 17:41:14
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-12-12 20:58:02
 * @FilePath: /Obsidian Vault/graphics/详解Three中Matrix.md
-->

# Threejs 中各种矩阵的详解

## ModalMatrix (模型矩阵)
物体以自身为为原点建立坐标系，经过多次模型变换的结果为模型矩阵，常见的模型变换操作
例如平移、缩放、旋转、镜像等。

$$ ModalMatrix = M_i \times M_j \times M_k \times (...) $$

```javascript
const object = new Object3D()
// 移动(x,y,z)
object.applyMatrix4(new Matrix4().makeTranslation(x,y,z));
// 绕X轴旋转q
object.applyMatrix4(new Matrix4().makeRotationX(q));
// 缩放(j,k,i)
object.applyMatrix4(new Matrix4().makeScale(j,k,i));
// 移动(x1,y2,z2)
object.applyMatrix4(new Matrix4().makeTranslation(x1,y2,z2));
//...任意操作
```

最终这个矩阵会被分解成三部分，position、rotation、scale。按照先缩放，在旋转，最后移动的顺序进行变换

## MatrixWorld (世界矩阵)
世界矩阵是模型矩阵和父物体世界矩阵的乘积的结果。即
$$ obj.matrixWorld = obj.matrix \times obj.parent.matrixWorld $$

等同于

$$ obj.matrixWorld = obj.matrix \times obj.parent.matrix \times obj.parent.parent.matrix \times (...) $$

一般用于计算将物体的局部坐标系转为世界坐标系中的位置。

```javascript
// 例如模型object上的任意顶点为(x,y,z)
const vertexInWorld = new Vector3(x,y,z).applyMatrix4(object.matrixWorld);
// 求出的结果为世界坐标系下的该顶点位置
```

## MatrixWorldInverse (世界矩阵的逆)
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

## ProjectionMatrix (投影矩阵)

投影矩阵分为两种，正交投影和透视投影。一般用于将三维坐标转换为视锥体坐标系下的坐标。

![Alt text](./resource/PO.webp)

```javascript
// v为世界坐标系下任意一点值为(x,y,z)
const v = new Vector3(x,y,z);
// 转换为相机坐标系下
v.applyMatrix4(camera.matrixWorldInverse);
// 转为视锥体坐标系下
v.applyMatrix4(camera.projectionMatrix);

// 简便写法
v.project(camera);

```

## NormalMatrix (法线矩阵)
法线矩阵用于将物体坐标系下的法线转换为相机坐标系下的法线。一般应用于光照物体的光照计算。
是物体modalView的逆矩阵的转置矩阵。
```javascript
const normalMatrix = new Matrix3().getNormalMatrix(camera.matrixWorldInverse.clone().multiply(object.matrixWorld));
//或者直接使用object.modalView
const normalMatrix = new Matrix3().getNormalMatrix(object.matrixWorld);
```

## ViewPortMatrix (视口矩阵)







