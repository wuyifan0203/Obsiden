# FragCoord(Vec4)
`FragCoord` 是在片段着色器中内置的变量，用于表示当前片段的屏幕坐标。
方向上来看：屏幕左下角是(0,0,0)（右手系），Z值越大距离屏幕越远
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
