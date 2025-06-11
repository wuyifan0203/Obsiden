
## camera
* camera: 基于three camera封装的基类
* I_camera: 定义的ICamera接口
* orthogomal_camera:基于正交相机的封装
* perspective_camera:基于透视相机的封装

## render_node
* abstract_render_node:节点的抽象类
* element_render_group:对于RenderNode的聚合
* en_render_node_type:对于RenderNode的类型定义（点，边，Mesh，精灵，未知）
* i_style:点的样式，线的样式，Mesh样式，渐变样式，纹理样式等的定义
* render_area:是否高亮状态的定义
* render_edge:基于RenderNode封装的Edge
* render_mesh:基于RenderNode封装的Mesh
* render_point:基于RenderNode封装的Point
* render_sprite:基于RenderNode封装的Sprite
* status:节点的状态定义（可选中，可见，可编辑）

## threejs_render
### buffer_geometry_render
* abstract_buffer_geometry_render:BufferGeometryRender的抽象类，render方法传入RenderNode，通过createGeometry，返回BufferGeometry
* buffer_line_render:基于BufferGeometryRender的BufferLineRender
* buffer_mesh_render:基于BufferGeometryRender的BufferMeshRender
* buffer_point_render:基于BufferGeometryRender的BufferPointRender
* buffer_sprite_render:基于BufferGeometryRender的BufferSpriteRender
* i_buffer_geometry_render:BufferGeometryRender的接口定义
* index：buffer_geometry_render的工厂函数，根据RenderNode的类型，返回对应的BufferGeometryRender

### clipping
#### clipping_material: 基于ShaderMaterial的裁剪材质
* clipping_manager:对于裁剪的管理类 （添加平面，删除平面，渲染，排除某物体...）
* edge_detection_material:基于ShaderMaterial的边缘检测材质
* material_copy:根据纹理的alpha值判断是否需要输出颜色的材质
### material
* gradientx_material:基于ShaderMaterial的渐变材质
* highlight_point_material:基于ShaderMaterial的点的高亮材质
### material_creator
* abstract_material_creator:MaterialCreator的抽象类，穿入style，尺寸，RenderNode返回THREE.Material
* i_material_creator:MaterialCreator的接口定义
* line_material_creator:基于MaterialCreator的LineMaterialCreator，返回LineBasicMaterial，或者LineDashedMaterial，LineMaterial
* material_creator_proxy：根据RenderNode的类型，返回对应的MaterialCreator创建的材料
* mesh_material_creator:基于MaterialCreator的MeshMaterialCreator，返回GradientxMaterial，MeshBasicMaterial,MeshPhongMaterial,HighlightPointMaterial，WireframeMaterial（MeshBasicMaterial. wireframe为true）
* point_material_creator:基于MaterialCreator的PointMaterialCreator，根据渐变类型生成Canvastexture纹理返回的PointMaterial，
* sprite_material_creator:基于MaterialCreator的SpriteMaterialCreator，返回SpriteMaterial，精灵图不参与裁剪
* texture_loader:基于TextureLoader的纹理加载器，返回THREE.Texture
### merger
* default_object3d_merger:merger的默认实现
* i_object3d_merger:merger的接口定义
* line_segments_merger:根据材质类型和renderOrder分组，将多组线段进行合并,返回LineSegments[]
* line_segments2_merger:根据材质类型和renderOrder分组，将多组线段进行合并,返回LineSegments2[]
* mesh_merger:根据材质类型和hasUV分组，将多组Mesh进行合并,返回Mesh[]
* point_merger:根据材质类型，将多组点进行合并,返回Points[]

* full_screen_quad:全屏Quad
* gpu_pick_materials:生成用于pick的材质（点，遮罩，线，遮罩线，面，遮罩面）
* gpu_util:颜色转换id，生成螺旋选中点（不知道在干嘛）
* line_creator:根据灯光类型生成光源的工厂函数
* material_manager:维护一套关系用于确保材质的唯一性，没有使用材质则会删除，存在不存在的材质通过material_creator_proxy创建
* object_utils:meregeGeonmetry
* object3d_builder:创建Object3D的工厂类，根据RenderNode类型，geometry，material，返回Object3D
* object3d_disposer:Object3D的销毁器，用于销毁Object3D,销毁geometry，material，map texture
* render_context:核心，提供怎删改查的方法，同过RenderNodeObject，建立RenderNode，bufferGeometry，和生成的渲染对象以及GPUpick对象的联系，同步更新渲染对象和GPUpick对象
* threejs_light: 生成环境光和四个方向的平行光，，根据相机位置进行更新，以及销毁处理
* threejs_pick_context:根据是否为精灵分为两个场景，生成两个renderTarget，用于pick，同步主场景的平面切割
* index: threejs_render的类的实现，提供增删改查，拾取判断，高亮，渲染，销毁等方法

## others
* create_i_render:根据RenderType类型，生成对应的IRender实例，默认生成ThreejsRender实例（未来可能会拓展）
* i_light_typedef:灯光类型的参数以及定义（环境光，平行光，聚光）
* i_math_typedef:数学类型的定义（向量，矩阵，边，线段）
* i_render：定义iRender的类型，以及一些IRender参数的类型
* null_render:空的IRender实例
* utils：只有一个isNumber方法，用于判断是否为数字
