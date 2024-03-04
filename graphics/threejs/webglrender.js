/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-02-29 15:45:49
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-03-04 16:41:24
 * @FilePath: /Obsidian Vault/graphics/threejs/webglrender.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
// 对three.js的render流程的分析


vpMatrix = new Matrix4();
frustum = new Frustum();
renderStateStack = [];
class webglRenderer {
    constructor() {
        this.renderStateStack = [];

    }

    render(scene, camera) {
        // 1.更新场景的世界矩阵
        scene.updateMatrixWorld();
        //2. 更新相机的矩阵和视锥体
        camera.updateMatrixWorld();

        // 执行渲染前的回调
        scene?.onBeforeRender(this, scene, camera, _renderTarget);

        // 拿到当前场景的渲染状态容器中（WebGLRenderState），没有就新建
        let renderState = this.renderStates.getRenderState(scene);
        if (!renderState) {
            renderState = new WebGLRenderState()
        }

        // 初始化状态
        renderState.init();
        // 将状态加到状态栈里
        renderStateStack.push(renderState);

        // 计算VP矩阵，更新视椎体
        vpMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        frustum.setFromProjectionMatrix(vpMatrix);

        // 获取渲染列表
        let renderList = renderLists.getRenderList(scene);

    }
}