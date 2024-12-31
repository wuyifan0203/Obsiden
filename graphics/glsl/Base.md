# FragCoord(Vec4)
`FragCoord` 是在片段着色器中内置的变量，用于表示当前片段的屏幕坐标。
- `gl_FragCoord.x`：片段在屏幕上的 x 坐标，以像素为单位，范围通常是 [0, 宽度]。
- `gl_FragCoord.y`：片段在屏幕上的 y 坐标，以像素为单位，范围通常是 [0, 高度]。
- `gl_FragCoord.z`：片段的深度值，范围通常在 [0, 1] 之间，用于表示该片段在深度缓冲中的值。
- `gl_FragCoord.w`：齐次坐标中的 w 分量，来源于顶点着色器中的透视除法之前的 w 值。

方向上来看：屏幕左下角是(0,0,0)（右手系），Z值越大距离屏幕越远
### `gl_FragCoord.w` 和 `gl_FragCoord.z` 的含义

- **`gl_FragCoord.w`**：在透视投影变换过程中，`w` 分量是与顶点的深度相关的齐次坐标值。在经过透视除法之前，齐次坐标是四维的 `(x, y, z, w)`，而经过透视除法后，最终得到的三维坐标是 `(x/w, y/w, z/w)`，即归一化设备坐标 (NDC, Normalized Device Coordinates)。`gl_FragCoord.w` 可以用于恢复线性深度值。
    
- **`gl_FragCoord.z`**：这是片段在窗口坐标中的深度值，范围通常在 [0, 1] 之间。它是经过透视投影矩阵转换之后得到的值，并且是非线性压缩的，通常会被用于深度缓冲，用于深度测试等操作。
```
        y    ^ z (0,0,1)
(0,1,0) ^  / 
        | /
        |/
        +--------> x
 (0,0,0)            (1,0,0)

```


# iResolution(Vec3)
`iResolution` 是一个内置 uniform 变量，表示当前渲染目标的分辨率或尺寸。
在大多数情况下，主要关注 `iResolution.xy`，其中 
* `iResolution.x` 表示渲染目标的宽度，
* `iResolution.y` 表示渲染目标的高度。
* `iResolution.z` 来表示额外的维度或信息。例如，在某些特定的渲染技术或算法中，可能需要使用立体渲染、多层渲染或体积渲染等。


# UV (Vec2)

```glsl
void main(){
	vec2 uv = fragCoord/iResolution.xy;
	// 等同于，用于归一化到整个屏幕
	vec2 uv = (fragCoord.x/iResolution.x, fragCoord.y/iResolution.y);
}
```


# Struct
```GLSL
// 在主函数外定义
Struct ScanCircle {
	vec2 center;
	float radius;
	float speed;
}
// 传入uScanCircle
uniform ScanCircle uScanCircle;
```

