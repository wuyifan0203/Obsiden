# WebGL

## 渲染管线

1. 应用阶段
    * 数据传入显存
    * 设置渲染状态
    * 调用Draw call绘制
2. 几何阶段
    * Vertex Shader 顶点转换成图元
    * Tessellation Shader 曲面细分（可选）
    * Primitive Assembly 图元组装
    * Geometry Shader 几何着色器（可选）
    * Clipping 裁剪超出视锥体的图元
    * 裁切坐标经透视除法转换到标准化设备坐标（NDC）
3. 光栅化阶段
    * 三角形处理，确定三角形的顶点位置、纹理坐标、法线等属性
    * 扫描转换，将三角形经过扫描线，差值计算，边界测试，生成片元
    * Fragment Shader处理每个片元，计算每个片元的颜色、深度值等属性
    * 帧缓冲区 裁切测试-> alpha测试-> 模版测试 -> 深度测试 -> 混合
    * 输出到屏幕

## 常见的着色模型

- Lambertian -> MeshLambertMaterial
- Phong
- Blinn-Phong -> MeshStandardMaterial
- Toon -> MeshToonMaterial
- Cook-Torrance -> MeshPhysicalMaterial,MeshStandardMaterial
- Oren-Nayar

## 拾取

1. 射线拾取

2. GPU拾取
