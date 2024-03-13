/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-02-29 15:45:49
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-03-13 17:58:15
 * @FilePath: /Obsidian Vault/graphics/threejs/webglrender.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
// 对three.js的render流程的分析


const vpMatrix = new Matrix4();
const frustum = new Frustum();

const _vector3 = new Vector3();

class WebGLRenderer {
    constructor(parameters) {
        const canvas = document.createElementNS('canvas');

        this.gl = canvas.getContext('webgl');

        // 根据当前的浏览器环境，生成当前环境所支持的扩展的map
        this.extensions = new WebGLExtensions(this.gl);
        // 根据当前的浏览器环境，获取浏览器的极限值 ，最大的各向异性过滤值，将初始化参数转义成webgl识别的状态,
        this.capabilities = new WebGLCapabilities(this.gl, this.extensions, parameters);
        this.extensions.init(this.capabilities);

        this.info = new WebGlInfo(this.gl);

        this.state = new WebGLState(this.gl, this.extensions, this.capabilities);

        this.attributes = new WebGLAttributes(this.gl, this.capabilities);
        this.bindingStates = new WebGLBindingStates(this.gl, this.extensions, this.attributes, this.capabilities);
        this.geometries = new WebGLGeometries(this.gl, this.attributes, this.info, this.bindingStates);
        this.objects = new WebGLObjects(this.gl, this.geometries, this.attributes, this.info);
        this.shadowMap = new WebGLShadowMap(this.gl, this.objects, this.capabilities);
        this.background = new WebGLBackground(this, this.state, this, this.objects);

        // 所使用的StateStack的存储栈
        this.renderStateStack = [];
        // 存储所有的States
        this.WebGLRenderStates = new WeakMap();
        this.currentRenderState = null

        this.renderLists = WeakMap()
        this.renderListStack = [];
        this.currentRenderList = null;

        // 是否排序过的标志
        this.sortObjects = true;
        // 不透明物体的排序方法
        this._opaqueSort = null
        // 透明物体的排序方法
        this._transparentSort = null


    }

    render(scene, camera) {
        // 1.更新场景的世界矩阵
        scene.updateMatrixWorld();
        //2. 更新相机的矩阵和视锥体
        camera.updateMatrixWorld();

        // 执行渲染前的回调
        scene?.onBeforeRender(this, scene, camera, _renderTarget);

        // 拿到当前场景的渲染状态容器中（WebGLRenderStates），没有就新建
        this.currentRenderState = this.WebGLRenderStates.get(scene);
        if (!this.currentRenderState) {
            this.currentRenderState = new WebGLRenderState()
        }

        // 初始化状态
        renderState.init();
        // 将状态加到状态栈里
        renderStateStack.push(this.currentRenderState);

        // 计算VP矩阵，更新视椎体
        vpMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        frustum.setFromProjectionMatrix(vpMatrix);

        // 获取渲染列表,如果没有就创建
        this.currentRenderList = this.renderLists.get(scene);
        if (!this.currentRenderList) {
            this.currentRenderList = new WebGLRenderList()
        }

        // 初始化List
        renderList.init();
        // 将list加到列表栈里
        this.renderListStack.push(this.currentRenderList);

        // 将物体投影到相机空间坐标系
        this.projectObject(scene, camera, 0, this.sortObjects)

        this.currentRenderList.finish();

        if (this.sortObjects === true) {
            this.currentRenderList.sort(this._opaqueSort, this._transparentSort);
        }

        this.info.render.frame++;

        // 做平面切割

        const shadowsArray = this.currentRenderState.state.shadowsArray;
        this.shadowMap.render(shadowsArray, scene, camera);

        this.background.render(this.currentRenderList, scene);

        // 灯光初始化赋值，根据类型做一些不同的处理
        this.currentRenderState.setupLights();

        // 根据相机类型做渲染
        if (camera.isArrayCamera) {
            const cameras = camera.cameras;
            for (let i = 0, l = cameras.length; i < l; i++) {
                const camera2 = cameras[i];
                this.renderScene(this.currentRenderList, scene, camera2, camera2.viewport);
            }
        } else {
            this.renderScene(this.currentRenderList, scene, camera);
        }


    }

    projectObject(object, camera, groupOrder, sortObjects) {
        // 不展示则跳过
        if (object.visible === false) return;
        // 判断与相机是否统一层级
        const seeIt = object.layers.test(camera.layers);

        if (seeIt) {
            if (object?.isGroup) {
                groupOrder = object.renderOrder;
            } else if (object?.isLight) {
                // 记录光源
                this.currentRenderState.pushLight(object);
                if (object.castShadow) {
                    // 记录产生阴影的光源
                    this.currentRenderState.pushShadow(object);
                }
            } else if (object?.isMesh || object?.isLine || object?.isPoints) {
                // 判断物体是否在视锥体内
                if (object.frustumCulled || frustum.intersectsObject(object)) {
                    const geometry = this.objects.update(object);
                    // 这时geometry已经更新完成
                    const material = object.material;

                    if (sortObjects) {
                        geometry.computeBoundingSphere();
                        // 计算外接球的球心
                        _vector3.copy(geometry.boundingSphere.center);

                        // 将坐标投影到webgl坐标系
                        _vector3.applyMatrix4(object.matrixWorld).applyMatrix4(vpMatrix);

                    }

                    if (Array.isArray(material)) {
                        const groups = geometry.groups;
                        for (const group of groups) {
                            const groupMaterial = material[group.materialIndex];

                            if (groupMaterial && groupMaterial.visible) {
                                this.currentRenderList.push(object, geometry, groupMaterial, groupOrder, _vector3.z, group);
                            }
                        }
                    } else if (material.visible) {
                        this.currentRenderList.push(object, geometry, material, groupOrder, _vector3.z, null);
                    }

                }
            }

        }

        // 递归遍历
        for (let j = 0, k = object.children.length; j < k; j++) {
            this.projectObject(object.children[j], camera, groupOrder, sortObjects);
        }
    }

    renderScene(currentRenderList, scene, camera, viewport) {
        const opaqueObjects = currentRenderList.opaque;
        const transmissiveObjects = currentRenderList.transmissive;
        const transparentObjects = currentRenderList.transparent;

        currentRenderState.setupLightsView(camera);

        if (transmissiveObjects.length > 0) {
            renderTransmissivePass(opaqueObjects, transmissiveObjects, scene, camera);
        }

        if (viewport) this.state.viewport(viewport);

        // 先渲染不透明物体
        if (opaqueObjects.length > 0) this.renderObjects(opaqueObjects, scene, camera);
        // 再渲染透光物体
        if (transmissiveObjects.length > 0) this.renderObjects(transmissiveObjects, scene, camera);
        // 最后渲染透明物体
        if (transparentObjects.length > 0) this.renderObjects(transparentObjects, scene, camera);

        // 在渲染下一帧前，恢复到默认值
        this.state.buffers.depth.setTest(true);
        this.state.buffers.depth.setMask(true);
        this.state.buffers.color.setMask(true);

        this.state.setPolygonOffset(false);
    }

    renderObjects(renderList, scene, camera) {
        for (let j = 0, k = renderList.length; j < k; j++) {
            const { object, geometry, material, group } = renderList[j];

            if (object.layers.test(camera.layers)) {
                this.renderObject(object, scene, camera, geometry, material, group);
            }
        }

    }

    renderObject(object, scene, camera, geometry, material, group) {
        object.onBeforeRender(this, scene, camera, geometry, material, group);

        // 生成 V M 矩阵
        object.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, object.matrixWorld);
        // 更新物体的normalMatrix
        object.normalMatrix.getNormalMatrix(object.modelViewMatrix);

        material.onBeforeRender(this, scene, camera, geometry, material, group);

        // 是否强制单通道渲染
        if (material.transparent === true && material.side === DoubleSide && material.forceSinglePass === true) {
            material.side = BackSide;
            material.needsUpdate = true;
            this.renderBufferDirect(camera, scene, geometry, material, object, group);

            material.side = FrontSide;
            material.needsUpdate = true;
            this.renderBufferDirect(camera, scene, geometry, material, object, group);

            material.side = DoubleSide;
        } else {
            this.renderBufferDirect(camera, scene, geometry, material, object, group);
        }
    }

    renderBufferDirect(camera, scene, geometry, material, object, group) {

    }
}

class WebGlInfo {
    constructor() {
        this.memory = {
            geometries: 0,
            textures: 0
        };

        this.render = {
            frames: 0, // 用来统计从开始使用 webGLRender.render 的调用次数
        }
    }
}

class WebGLRenderState {
    constructor() {
        // 用来保存光源；
        this.lightsArray = [];
        // 用来保存能产生阴影的光源；
        this.shadowsArray = [];
    }

    init() {
        this.lightsArray.length = 0;
        this.shadowsArray.length = 0;
    }

    pushLight(light) {
        this.lightsArray.push(light);
    }

    pushShadow(shadowLight) {
        this.shadowsArray.push(shadowLight);
    }

    setupLights() {
        // 灯光初始化赋值，
        // 根据类型做一些不同的处理
        // 颜色，光强，角度，最大距离，衰减程度等
    }

    setupLightsView(camera) {
        // 根据光线类型做出不同的逻辑处理
        // 总体都会
        // 设置光线的位置
        // 将光线位置变换到视图矩阵下（转换到相机坐标系）
        // 赋值光线的方向
        // 将光线方向变换到视图矩阵（转换到相机坐标系）
    }

}

class WebGLObjects {
    constructor(gl, geometries, attributes, info) {
        this.updateMap = new WeakMap();
        this.info = info;
        this.geometries = geometries;
        this.attributes = attributes;
        this.gl = gl;
    }

    update(object) {
        const frame = this.info.render.frame;
        const geometry = object.geometry;

        // 检查这个物体是否添加过
        const bufferGeometry = this.geometries.get(object, geometry);

        // 判断这个物体有没有更新过，每帧只更新一次
        if (this.updateMap.get(bufferGeometry) !== frame) {
            //  更新geometry的信息
            this.geometries.update(bufferGeometry);
            updateMap.set(bufferGeometry, frame);
        }

        return geometry
    }
}

class WebGLGeometries {
    constructor(gl, info) {
        this.geometries = {};
        this.wireFrameAttributes = new WeakMap();

        this.info = info;
        this._gl = gl
    }

    onDisposeGeometry(event) {

    }


    get(object, geometry) {
        // 添加过的物体直接返回
        if (this.geometries[geometry.id] === true) return geometry;

        // 给新物体挂载销毁函数
        geometry.addEventListener('dispose', this.onDisposeGeometry)

        this.geometries[geometry.id] = true;

        this.info.memory.geometries++;

        return geometry;
    }

    update(geometry) {
        const geometryAttributes = geometry.attributes;

        for (const name of geometryAttributes) {
            // 根据当前attribute的名字
            this.attributes.update(geometryAttributes[name], this._gl.ARRAY_BUFFER);
        }
    }
}


class WebGLAttributes {
    // 管理全局的buffer，创建，更新，删除，查找
    constructor(gl, capabilities) {
        this.buffers = new WeakMap();
        this.gl = gl;
        this.isWebGL2 = capabilities.isWebGL2;
    }

    _createBuffer(attribute, bufferType) {
        const buffer = gl.createBuffer();
        gl.bindBuffer(bufferType, buffer);
        gl.bufferData(bufferType, attribute.array, usage);

        return {
            buffer,
            type,
            size,
        }
    }

    _updateBuffer() {
        // 更新
        const array = attribute.array;
        const updateRanges = attribute.updateRanges;

        this.gl.bindBuffer(bufferType, buffer);

        if (updateRanges.length === 0) {
            // 全部更新
            this.gl.bufferSubData(bufferType, 0, array);
        } else {
            // 局部更新
            for (const range of updateRanges) {
                if (isWebGL2) {
                    //
                } else {
                    //
                }
            }
            this.updateRanges.length = 0;
        }

    }

    update(attribute, bufferType) {
        const data = this.buffers.get(attribute);
        if (!data) {
            this.buffers.set(attribute, this._createBuffer(attribute, bufferType));
        } else {
            this._updateBuffer(data.buffer, attribute, bufferType)
        }
    }

    get(attribute) {
        return this.buffers.get(attribute);
    }

    remove(attribute) {
        const data = buffers.get(attribute);

        if (data) {

            gl.deleteBuffer(data.buffer);

            buffers.delete(attribute);

        }
    }
}

class WebGLCapabilities {
    // 用于检查和存储 WebGL 功能和限制的信息。它提供对这些信息的访问，并允许根据环境的能力和限制进行动态调整，以提供最佳的兼容性和性能。
    constructor(gl, extensions) {

    }
}

class WebGLExtensions {
    constructor(gl) {
        this.extensions = {};
        this._gl = gl;
    }

    init() {
        // 去判断当前环境支持哪些扩展，并做一些兼容性处理
        // webkit 内核 moz 内核
        // 如果支持则存入extensions
        if (enableExtensions) {
            this.extensions[extensionName] = extension;
        }
    }

    get(name) {
        // 拿到 name 的扩展
    }

    has(name) {
        // 检查有没有
    }
}

class WebGLBindingStates {
    constructor(gl, extensions, attributes, camera) {

    }
}

class WebGLRenderList {
    constructor(gl, extensions, attributes, camera) {
        this.renderItems = [];
        this.renderItemsIndex = 0;

        // 不透明的物体
        this.opaque = [];
        // 透明的物体
        this.transparent = [];
        // 能透射的物体
        this.transmissive = [];
    }

    init() {
        this.renderItems.length = 0;
        this.renderItemsIndex = 0;
        this.opaque.length = 0;
        this.transparent.length = 0;
        this.transmissive.length = 0;
    }

    push(object, geometry, material, groupOrder, z, group) {
        const renderItem = this.getNextRenderItem(object, geometry, material, groupOrder, z, group);

        // 模拟透射效果的，如薄布或玻璃等材质的透光效果，类似于透明物体，但是不同于透明物体
        if (material.transmissive) {
            this.transmissive.push(renderItem);
        } else if (material.transparent) {
            this.transparent.push(renderItem);
        } else {
            this.opaque.push(renderItem);
        }

    }


    // 生成一个软连接列表
    getNextRenderItem(object, geometry, material, groupOrder, z, group) {

        let renderItem = this.renderItems[this.renderItemsIndex];

        // 对内存进行复用
        if (renderItem === undefined) {
            renderItem = {
                id: object.id,
                object,
                geometry,
                material,
                groupOrder,
                renderOrder: object.renderOrder,
                z,
                group
            }

            this.renderItems[this.renderItemsIndex] = renderItem;
        } else {
            renderItem.id = object.id;
            renderItem.object = object;
            renderItem.geometry = geometry;
            renderItem.material = material;
            renderItem.groupOrder = groupOrder;
            renderItem.renderOrder = object.renderOrder;
            renderItem.z = z;
            renderItem.group = group;

        }

        this.renderItemsIndex++;
        return renderItem;
    }

    finish() {
        // 释放列表内没有用到的元素
        for (let i = this.renderItemsIndex, l = this.renderItems; i < l; i++) {
            const renderItem = this.renderItems[i];

            if (renderItem.id === null) break;
            renderItem.id = null;
            renderItem.object = null;
            renderItem.geometry = null;
            renderItem.material = null;
            renderItem.group = null;
        }
    }

    sort(customOpaqueSort, customTransparentSort) {
        if (this.opaque.length > 1) {
            this.opaque.sort(customOpaqueSort || painterSortStable);
        }
        if (transmissive.length > 1) {
            transmissive.sort(customTransparentSort || reversePainterSortStable);
        }
        if (transparent.length > 1) {
            transparent.sort(customTransparentSort || reversePainterSortStable);
        }
    }

}

/** 
 * 这里对不透明物体的排序顺序的优先级做的排序
 * 优先渲染groupOrder和renderOrder是确保渲染流程中逻辑上的正确性和优先级
 * 在上述情况相同的情况下考虑材料
 * 确保相同材料的对象被连续渲染。这减少了渲染过程中的状态切换次数，从而优化了渲染性能。
 * 在材料相同的情况下考虑深度，先渲染远离相机的物体
 * 最后考虑的是先后添加顺序（默认id是根据add的先后自增）
*/
function painterSortStable(a, b) {
    if (a.groupOrder !== b.groupOrder) {
        return a.groupOrder - b.groupOrder;
    } else if (a.renderOrder !== b.renderOrder) {
        return a.renderOrder - b.renderOrder;
    } else if (a.material.id !== b.material.id) {
        return a.material.id - b.material.id;
    } else if (a.z !== b.z) {
        return a.z - b.z;
    } else {
        return a.id - b.id;
    }
}

/**
 * 这里对透明物体的排序顺序的优先级做的排序
 * 为什么这次没有对材料做排序
 * 首先最重要的是保证自定义的渲染顺序的正确性
 * 其次为了让物体透明度混合的正确，需要采用画家算法，即从远绘制到近
 * 可以对材料的id排序进行忽略，因为侧重点在渲染的正确性上
 */
function reversePainterSortStable(a, b) {
    if (a.groupOrder !== b.groupOrder) {
        return a.groupOrder - b.groupOrder;
    } else if (a.renderOrder !== b.renderOrder) {
        return a.renderOrder - b.renderOrder;
    } else if (a.z !== b.z) {
        return b.z - a.z;
    } else {
        return a.id - b.id;
    }
}

class WebGLShadowMap {
    constructor(renderer, objects, capabilities) {
        this._renderer = renderer;
        this._objects = objects;
        this._shadowMapSize = Vector2();
        this._viewport = Vector4();

        ///...
    }
    render(lights, objects, camera) {
        if (lights.length === 0) return;

        const currentRenderTarget = this._renderer.getRenderTarget();
        const activeCubeFace = this._renderer.getActiveCubeFace();
        const activeMipmapLevel = this._renderer.getActiveMipmapLevel();

        const _state = this._renderer.state;
        _state.setBlending(NoBlending);
        _state.buffers.color.setClear(1, 1, 1, 1);
        _state.buffers.depth.setTest(true);
        _state.setScissorTest(false);

        for (let i = 0, il = lights.length; i < il; i++) {
            const light = lights[i];
            const shadow = light.shadow;

            this._shadowMapSize.copy(shadow.mapSize);

            if (shadow.map === null) {

                shadow.map = new WebGLRenderTarget()
                shadow.camera.updateProjectionMatrix();
            }

            this._renderer.setRenderTarget(shadow.map);
            this._renderer.clear();

            //根据视口个数进行渲染
            for (let vp = 0, il = shadow.getViewportCount(); vp < il; vp++) {

                const viewport = shadow.getViewport(vp);

                this._viewport.copy(viewport);

                renderObject(scene, camera, shadow.camera, light, this.type);

            }
            shadow.needsUpdate = false;
        }

        scope.needsUpdate = false;
        _renderer.setRenderTarget(currentRenderTarget, activeCubeFace, activeMipmapLevel);
    }
}

class WebGLBackground {
    constructor(renderer, state, object, alpha) {
        this.renderer = renderer;
        this.state = state;
        this.object = object;
        this.alpha = alpha;
    }

    render(renderList, scene) {
        // 根据scene background 的类型做出不同的行为

        if (scene.background === null) {
            this.renderer.setClearColor('#000000', this.alpha);
        } else if (scene.background?.isColor === true) {
            this.renderer.setClearColor(scene.background, this.alpha);
        }

        if (this.renderer.autoClear === true) {
            this.renderer.clear(this.renderer.autoClearColor, this.renderer.autoClearDepth, this.renderer.autoClearStencil);
        }

        if (scene.background?.isCubeTexture === true) {
            const boxMesh = new Mesh(new boxGeometry(1, 1, 1), new ShaderMaterial({ map: scene.background }))
            renderList.unshift(boxMesh, boxMesh.geometry, boxMesh.material, 0, 0, null);
        } else if (scene.background?.isTexture === true) {
            const planeMesh = new Mesh(new PlaneGeometry(1, 1), new ShaderMaterial({ map: scene.background }))
            renderList.unshift(planeMesh, planeMesh.geometry, planeMesh.material, 0, 0, null);
        }

    }
}

class WebGLState {
    /**
     * 这个类是webgl的状态机
     * 作用:控制webgl 的所有状态
     * viewport 绑定视口
     * Blending 混合
     * CullFace 面剔除
     * depthTest 深度测试
     * depthWrite
     * polygonOffset
     * stencil
     * 等等 
    */
    constructor(gl, extension, capabilities) {
        this.gl = gl;
        this.extension = extension;
        this.capabilities = capabilities;

        // 帧缓冲区
        this.buffers = {
            color: new ColorBuffer(),
            depth: new DepthBuffer(),
            stencil: new StencilBuffer()
        }
    }

    viewport(viewport) {
        this.gl.viewport(viewport.x, viewport.y, viewport.z, viewport.w);
    }

    setPolygonOffset(polygonOffset, factor, units) {
        if (polygonOffset) {
            this.gl.enable(this.gl.POLYGON_OFFSET_FILL);
            this.gl.polygonOffset(factor, units)
        } else {
            this.gl.disable(this.gl.POLYGON_OFFSET_FILL);
        }
    }
}