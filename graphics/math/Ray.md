
## 定义
$$\vec{P} = O + \vec{D} \times t $$

由原点O 眼方向D经过时间t到达的终点P

## 与AABB相交检测

将问题本质看成一维，即在数轴上
物理常识  $d = p + t \times v$ ,其中 P是初始距离，t是运动时间，v是运动速度，得到d是最终距离

![[ray_AABB.png]]

现在给定范围 d1 和 d2
计算所需要时间t
根据公式 得到 $t=\frac{d-p}{v}$，可以计算出t1和t2，
如果v等于0，p点不满足 d1 < p <d2 ,则无轮多久都不会经过
如果计算出t<0,则认为方向相反，不会经过d1 ,d2

在二维平面中，可以将射线方程分解
$$\begin{cases}
P_x = O_x + D_x \times t
\\ P_y = O_y + D_y \times t
\end{cases}$$
在三维空间中，同理分解
$$\begin{cases}
P_x = O_x + D_x \times t
\\ P_y = O_y + D_y \times t
\\ P_z = O_z + D_z \times t
\end{cases}$$
分别对三个轴做判断，满足的上述条件的则认为相交，可以写成代码
```TypeScript
function rayIntersectAABB(rayOrigin, rayDir, aabbMin, aabbMax) {
	let tMin = -Infinity;
	let tMax = Infinity;

	// 检查每个轴方向 (x, y, z)
	for (let i = 0; i < 3; i++) {
		const origin = rayOrigin[i];
	    const dir = rayDir[i];
	    const min = aabbMin[i];
	    const max = aabbMax[i];

		if (Math.abs(dir) < 1e-6) {
		    // 如果射线方向几乎为零，说明射线平行于该轴
		    // 如果起点不在边界范围内，则无交点
			if (origin < min || origin > max) {
				return null;
		    }
		} else {
		    // 计算 t1 和 t2
			const t1 = (min - origin) / dir;
		    const t2 = (max - origin) / dir;

		    // 确保 t1 是较小的那个值，t2 是较大的那个值
		    const tNear = Math.min(t1, t2);
		    const tFar = Math.max(t1, t2);

		    // 更新 tMin 和 tMax
		    tMin = Math.max(tMin, tNear);
			tMax = Math.min(tMax, tFar);

			// 如果 tMin > tMax，说明没有交点
			if (tMin > tMax) {
				return null;
			}
		}
	}

	// 如果 tMax < 0，说明交点在射线起点的反方向
	if (tMax < 0) {
		return null;
	}
	// 返回 tMin，表示射线与边界框的第一个交点 
	return tMin;
}
```

如果需要求焦点则把t代入

## 与包装圆相交检测
圆的公式为  $(x-h)^2 + (y-k)^2 = r^2$,其中（h,k）表示圆心，r表示半径
球的表面公式为 $(\vec P - \vec C) \cdot (\vec P - \vec C) = r^2$,其中$\vec P$是球体上一点，$\vec C$代表球上一点，r表示半径

将摄像方程与之联立，在计算二维时与圆联立，三维计算与球联立

代入后

$$((\vec O + t \cdot \vec D )-\vec C) \cdot ((\vec O + t \cdot \vec D )-\vec C) = r^2$$
展开方程整理，得到一个关于t的二次方程

$$a \cdot t^2 + b \cdot t + c = 0 $$
其中
* $a = \vec D \cdot \vec D$  (方向向量的平方)
* $b = 2 \cdot ((\vec O - \vec C) \cdot \vec D)$ （射线起点与球心的距离与射线方向的点积）
* $c = (\vec O - \vec C) \cdot (\vec O - \vec C) - r^2$ (射线起点与球心的距离的平方减去球体半径的平方)

这个方程的解 $t$ 就是射线与球体相交的参数，解出后可以代入射线方程计算出交点。

### 判断是否相交

直接计算二次方程的判别式 :$\Delta = b^2 - 4ac$
* $\Delta < 0$,，没有交点，射线与球体不相交。
* $\Delta = 0$，有一个交点，射线与球体相切。
* $\Delta > 0$，有两个交点，射线与球体相交，射线穿过球体。

### 求交点

利用求根公式 
$$t = \frac{-b \pm \sqrt \Delta}{2a}$$求出后取t最小的只为第一焦点

```TypeScript
function rayIntersectSphere(rayOrigin, rayDir, sphereCenter, sphereRadius) {
	const oc = [
		rayOrigin[0] - sphereCenter[0],
	    rayOrigin[1] - sphereCenter[1],
	    rayOrigin[2] - sphereCenter[2]
	];

	const a = rayDir[0] ** 2 + rayDir[1] ** 2 + rayDir[2] ** 2;
	const b = 2 * (oc[0] * rayDir[0] + oc[1] * rayDir[1] + oc[2] * rayDir[2]);
	const c = oc[0] ** 2 + oc[1] ** 2 + oc[2] ** 2 - sphereRadius ** 2;

	const discriminant = b ** 2 - 4 * a * c;

	if (discriminant < 0) {
		return null; // 没有交点
	} else {
		const t1 = (-b - Math.sqrt(discriminant)) / (2 * a);
		const t2 = (-b + Math.sqrt(discriminant)) / (2 * a);

		// 返回最近的正交点
		const t = t1 >= 0 ? t1 : t2;
		if (t < 0) return null;

		const intersectionPoint = [
			rayOrigin[0] + t * rayDir[0],
			rayOrigin[1] + t * rayDir[1],
			rayOrigin[2] + t * rayDir[2]
		];

		return intersectionPoint;
	}
}
```