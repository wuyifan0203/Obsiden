/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-02-29 15:45:49
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-03-06 15:55:45
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

        this.attributes = new WebGLAttributes(this.gl, this.capabilities);
        this.bindingStates = new WebGLBindingStates(this.gl, this.extensions, this.attributes, this.capabilities);
        this.geometries = new WebGLGeometries(this.gl, this.attributes, this.info, this.bindingStates);
        this.objects = new WebGLObjects(this.gl, this.geometries, this.attributes, this.info);

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
        projectObject(scene, camera, 0, this.sortObjects)

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

                }
            }

        }

        // 递归遍历
        for (let j = 0, k = object.children.length; j < k; j++) {
            this.projectObject(object.children[j], camera, groupOrder, sortObjects);
        }
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
        this.lights = new WebGLLights();
        this.lightsArray = [];
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

    setupLights(useLegacyLights) {
        this.lights.setup(this.lightsArray, useLegacyLights);
    }

    setupLightsView(camera) {
        this.lights.setupView(this.lightsArray, camera);
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

            this.attributes.update(geometryAttributes[name], this._gl.ARRAY_BUFFER);
        }
    }
}


class WebGLAttributes {
    // 管理全局的buffer，创建，更新，删除，查找
    constructor(gl, capabilities) {
        this.buffers = new WeakMap();
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