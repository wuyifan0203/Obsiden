/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-02-29 15:45:49
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-03-05 18:04:48
 * @FilePath: /Obsidian Vault/graphics/threejs/webglrender.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
// 对three.js的render流程的分析


const vpMatrix = new Matrix4();
const frustum = new Frustum();
class webglRenderer {
    constructor() {
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
                    

                }
            }

        }

        // 递归遍历
        for (let j = 0, k = object.children.length; j < k; j++) {
            this.projectObject(object.children[j], camera, groupOrder, sortObjects);
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
    constructor() {
        this.updateMap = new WeakMap();
    }
}