var UI=pc.createScript("ui");UI.attributes.add("css",{type:"asset",assetType:"css",title:"CSS Asset"}),UI.attributes.add("html",{type:"asset",assetType:"html",title:"HTML Asset"}),UI.prototype.initialize=function(){var t=document.createElement("style");document.head.appendChild(t),t.innerHTML=this.css.resource||"",this.div=document.createElement("div"),this.div.classList.add("container"),this.div.innerHTML=this.html.resource||"",document.body.appendChild(this.div),this.counter=0},UI.prototype.update=function(t){var e=this.app;const s=window.innerWidth,i=window.innerHeight;console.log(i),s<900?(e.resizeCanvas(s,2*i/3),e.setCanvasFillMode("FILLMODE_NONE")):e.resizeCanvas(s,i)};var TouchInput=pc.createScript("touchInput");TouchInput.attributes.add("orbitSensitivity",{type:"number",default:.4,title:"Orbit Sensitivity",description:"How fast the camera moves around the orbit. Higher is faster"}),TouchInput.attributes.add("distanceSensitivity",{type:"number",default:.2,title:"Distance Sensitivity",description:"How fast the camera moves in and out. Higher is faster"}),TouchInput.prototype.initialize=function(){this.orbitCamera=this.entity.script.orbitCamera,this.lastTouchPoint=new pc.Vec2,this.lastPinchMidPoint=new pc.Vec2,this.lastPinchDistance=0,this.orbitCamera&&this.app.touch&&(this.app.touch.on(pc.EVENT_TOUCHSTART,this.onTouchStartEndCancel,this),this.app.touch.on(pc.EVENT_TOUCHEND,this.onTouchStartEndCancel,this),this.app.touch.on(pc.EVENT_TOUCHCANCEL,this.onTouchStartEndCancel,this),this.app.touch.on(pc.EVENT_TOUCHMOVE,this.onTouchMove,this),this.on("destroy",(function(){this.app.touch.off(pc.EVENT_TOUCHSTART,this.onTouchStartEndCancel,this),this.app.touch.off(pc.EVENT_TOUCHEND,this.onTouchStartEndCancel,this),this.app.touch.off(pc.EVENT_TOUCHCANCEL,this.onTouchStartEndCancel,this),this.app.touch.off(pc.EVENT_TOUCHMOVE,this.onTouchMove,this)})))},TouchInput.prototype.getPinchDistance=function(t,i){var o=t.x-i.x,n=t.y-i.y;return Math.sqrt(o*o+n*n)},TouchInput.prototype.calcMidPoint=function(t,i,o){o.set(i.x-t.x,i.y-t.y),o.scale(.5),o.x+=t.x,o.y+=t.y},TouchInput.prototype.onTouchStartEndCancel=function(t){var i=t.touches;1==i.length?this.lastTouchPoint.set(i[0].x,i[0].y):2==i.length&&(this.lastPinchDistance=this.getPinchDistance(i[0],i[1]),this.calcMidPoint(i[0],i[1],this.lastPinchMidPoint))},TouchInput.fromWorldPoint=new pc.Vec3,TouchInput.toWorldPoint=new pc.Vec3,TouchInput.worldDiff=new pc.Vec3,TouchInput.prototype.pan=function(t){var i=TouchInput.fromWorldPoint,o=TouchInput.toWorldPoint,n=TouchInput.worldDiff,h=this.entity.camera,c=this.orbitCamera.distance;h.screenToWorld(t.x,t.y,c,i),h.screenToWorld(this.lastPinchMidPoint.x,this.lastPinchMidPoint.y,c,o),n.sub2(o,i),this.orbitCamera.pivotPoint.add(n)},TouchInput.pinchMidPoint=new pc.Vec2,TouchInput.prototype.onTouchMove=function(t){var i=TouchInput.pinchMidPoint,o=t.touches;if(1==o.length){var n=o[0];this.orbitCamera.pitch-=(n.y-this.lastTouchPoint.y)*this.orbitSensitivity,this.orbitCamera.yaw-=(n.x-this.lastTouchPoint.x)*this.orbitSensitivity,this.lastTouchPoint.set(n.x,n.y)}else if(2==o.length){var h=this.getPinchDistance(o[0],o[1]),c=h-this.lastPinchDistance;this.lastPinchDistance=h,this.orbitCamera.distance-=c*this.distanceSensitivity*.1*(.1*this.orbitCamera.distance),this.calcMidPoint(o[0],o[1],i),this.pan(i),this.lastPinchMidPoint.copy(i)}};var OrbitCamera=pc.createScript("orbitCamera");OrbitCamera.attributes.add("autoRender",{type:"boolean",default:!0,title:"Auto Render",description:"Disable to only render when camera is moving (saves power when the camera is still)"}),OrbitCamera.attributes.add("distanceMax",{type:"number",default:0,title:"Distance Max",description:"Setting this at 0 will give an infinite distance limit"}),OrbitCamera.attributes.add("distanceMin",{type:"number",default:0,title:"Distance Min"}),OrbitCamera.attributes.add("pitchAngleMax",{type:"number",default:90,title:"Pitch Angle Max (degrees)"}),OrbitCamera.attributes.add("pitchAngleMin",{type:"number",default:-90,title:"Pitch Angle Min (degrees)"}),OrbitCamera.attributes.add("inertiaFactor",{type:"number",default:0,title:"Inertia Factor",description:"Higher value means that the camera will continue moving after the user has stopped dragging. 0 is fully responsive."}),OrbitCamera.attributes.add("focusEntity",{type:"entity",title:"Focus Entity",description:"Entity for the camera to focus on. If blank, then the camera will use the whole scene"}),OrbitCamera.attributes.add("frameOnStart",{type:"boolean",default:!0,title:"Frame on Start",description:'Frames the entity or scene at the start of the application."'}),Object.defineProperty(OrbitCamera.prototype,"distance",{get:function(){return this._targetDistance},set:function(t){this._targetDistance=this._clampDistance(t)}}),Object.defineProperty(OrbitCamera.prototype,"pitch",{get:function(){return this._targetPitch},set:function(t){this._targetPitch=this._clampPitchAngle(t)}}),Object.defineProperty(OrbitCamera.prototype,"yaw",{get:function(){return this._targetYaw},set:function(t){this._targetYaw=t;var i=(this._targetYaw-this._yaw)%360;this._targetYaw=i>180?this._yaw-(360-i):i<-180?this._yaw+(360+i):this._yaw+i}}),Object.defineProperty(OrbitCamera.prototype,"pivotPoint",{get:function(){return this._pivotPoint},set:function(t){this._pivotPoint.copy(t)}}),OrbitCamera.prototype.focus=function(t){this._buildAabb(t,0);var i=this._modelsAabb.halfExtents,e=Math.max(i.x,Math.max(i.y,i.z));e/=Math.tan(.5*this.entity.camera.fov*pc.math.DEG_TO_RAD),e*=2,this.distance=e,this._removeInertia(),this._pivotPoint.copy(this._modelsAabb.center)},OrbitCamera.distanceBetween=new pc.Vec3,OrbitCamera.prototype.resetAndLookAtPoint=function(t,i){this.pivotPoint.copy(i),this.entity.setPosition(t),this.entity.lookAt(i);var e=OrbitCamera.distanceBetween;e.sub2(i,t),this.distance=e.length(),this.pivotPoint.copy(i);var a=this.entity.getRotation();this.yaw=this._calcYaw(a),this.pitch=this._calcPitch(a,this.yaw),this._removeInertia(),this._updatePosition(),this.autoRender||(this.app.renderNextFrame=!0)},OrbitCamera.prototype.resetAndLookAtEntity=function(t,i){this._buildAabb(i,0),this.resetAndLookAtPoint(t,this._modelsAabb.center)},OrbitCamera.prototype.reset=function(t,i,e){this.pitch=i,this.yaw=t,this.distance=e,this._removeInertia(),this.autoRender||(this.app.renderNextFrame=!0)},OrbitCamera.prototype.initialize=function(){this._checkAspectRatio(),this._modelsAabb=new pc.BoundingBox,this._buildAabb(this.focusEntity||this.app.root,0),this.entity.lookAt(this._modelsAabb.center),this._pivotPoint=new pc.Vec3,this._pivotPoint.copy(this._modelsAabb.center);var t=this.entity.getRotation();if(this._yaw=this._calcYaw(t),this._pitch=this._clampPitchAngle(this._calcPitch(t,this._yaw)),this.entity.setLocalEulerAngles(this._pitch,this._yaw,0),this._distance=0,this._targetYaw=this._yaw,this._targetPitch=this._pitch,this.frameOnStart)this.focus(this.focusEntity||this.app.root);else{var i=new pc.Vec3;i.sub2(this.entity.getPosition(),this._pivotPoint),this._distance=this._clampDistance(i.length())}this._targetDistance=this._distance,this._autoRenderDefault=this.app.autoRender,this.app.autoRender&&(this.app.autoRender=this.autoRender),this.autoRender||(this.app.renderNextFrame=!0),this.on("attr:autoRender",(function(t,i){this.app.autoRender=t,this.autoRender||(this.app.renderNextFrame=!0)}),this),this.on("attr:distanceMin",(function(t,i){this._targetDistance=this._clampDistance(this._distance)}),this),this.on("attr:distanceMax",(function(t,i){this._targetDistance=this._clampDistance(this._distance)}),this),this.on("attr:pitchAngleMin",(function(t,i){this._targetPitch=this._clampPitchAngle(this._pitch)}),this),this.on("attr:pitchAngleMax",(function(t,i){this._targetPitch=this._clampPitchAngle(this._pitch)}),this),this.on("attr:focusEntity",(function(t,i){this.frameOnStart?this.focus(t||this.app.root):this.resetAndLookAtEntity(this.entity.getPosition(),t||this.app.root)}),this),this.on("attr:frameOnStart",(function(t,i){t&&this.focus(this.focusEntity||this.app.root)}),this);var onResizeCanvas=function(){this._checkAspectRatio(),this.autoRender||(this.app.renderNextFrame=!0)};this.app.graphicsDevice.on("resizecanvas",onResizeCanvas,this),this.on("destroy",(function(){this.app.graphicsDevice.off("resizecanvas",onResizeCanvas,this),this.app.autoRender=this._defaultAutoRender}),this)},OrbitCamera.prototype.update=function(t){if(!this.autoRender){var i=Math.abs(this._targetDistance-this._distance),e=Math.abs(this._targetYaw-this._yaw),a=Math.abs(this._targetPitch-this._pitch);this.app.renderNextFrame=this.app.renderNextFrame||i>.01||e>.01||a>.01}var s=0===this.inertiaFactor?1:Math.min(t/this.inertiaFactor,1);this._distance=pc.math.lerp(this._distance,this._targetDistance,s),this._yaw=pc.math.lerp(this._yaw,this._targetYaw,s),this._pitch=pc.math.lerp(this._pitch,this._targetPitch,s),this._updatePosition()},OrbitCamera.prototype._updatePosition=function(){this.entity.setLocalPosition(0,0,0),this.entity.setLocalEulerAngles(this._pitch,this._yaw,0);var t=this.entity.getPosition();t.copy(this.entity.forward),t.scale(-this._distance),t.add(this.pivotPoint),this.entity.setPosition(t)},OrbitCamera.prototype._removeInertia=function(){this._yaw=this._targetYaw,this._pitch=this._targetPitch,this._distance=this._targetDistance},OrbitCamera.prototype._checkAspectRatio=function(){var t=this.app.graphicsDevice.height,i=this.app.graphicsDevice.width;this.entity.camera.horizontalFov=t>i},OrbitCamera.prototype._buildAabb=function(t,i){var e,a=0,s=0;if(t instanceof pc.Entity){var n=[],r=t.findComponents("render");for(a=0;a<r.length;++a)if(e=r[a].meshInstances)for(s=0;s<e.length;s++)n.push(e[s]);var h=t.findComponents("model");for(a=0;a<h.length;++a)if(e=h[a].meshInstances)for(s=0;s<e.length;s++)n.push(e[s]);for(a=0;a<n.length;a++)0===i?this._modelsAabb.copy(n[a].aabb):this._modelsAabb.add(n[a].aabb),i+=1}for(a=0;a<t.children.length;++a)i+=this._buildAabb(t.children[a],i);return i},OrbitCamera.prototype._calcYaw=function(t){var i=new pc.Vec3;return t.transformVector(pc.Vec3.FORWARD,i),Math.atan2(-i.x,-i.z)*pc.math.RAD_TO_DEG},OrbitCamera.prototype._clampDistance=function(t){return this.distanceMax>0?pc.math.clamp(t,this.distanceMin,this.distanceMax):Math.max(t,this.distanceMin)},OrbitCamera.prototype._clampPitchAngle=function(t){return pc.math.clamp(t,-this.pitchAngleMax,-this.pitchAngleMin)},OrbitCamera.quatWithoutYaw=new pc.Quat,OrbitCamera.yawOffset=new pc.Quat,OrbitCamera.prototype._calcPitch=function(t,i){var e=OrbitCamera.quatWithoutYaw,a=OrbitCamera.yawOffset;a.setFromEulerAngles(0,-i,0),e.mul2(a,t);var s=new pc.Vec3;return e.transformVector(pc.Vec3.FORWARD,s),Math.atan2(s.y,-s.z)*pc.math.RAD_TO_DEG};var MouseInput=pc.createScript("mouseInput");MouseInput.attributes.add("orbitSensitivity",{type:"number",default:.3,title:"Orbit Sensitivity",description:"How fast the camera moves around the orbit. Higher is faster"}),MouseInput.attributes.add("distanceSensitivity",{type:"number",default:.15,title:"Distance Sensitivity",description:"How fast the camera moves in and out. Higher is faster"}),MouseInput.prototype.initialize=function(){if(this.orbitCamera=this.entity.script.orbitCamera,this.orbitCamera){var t=this,onMouseOut=function(o){t.onMouseOut(o)};this.app.mouse.on(pc.EVENT_MOUSEDOWN,this.onMouseDown,this),this.app.mouse.on(pc.EVENT_MOUSEUP,this.onMouseUp,this),this.app.mouse.on(pc.EVENT_MOUSEMOVE,this.onMouseMove,this),this.app.mouse.on(pc.EVENT_MOUSEWHEEL,this.onMouseWheel,this),window.addEventListener("mouseout",onMouseOut,!1),this.on("destroy",(function(){this.app.mouse.off(pc.EVENT_MOUSEDOWN,this.onMouseDown,this),this.app.mouse.off(pc.EVENT_MOUSEUP,this.onMouseUp,this),this.app.mouse.off(pc.EVENT_MOUSEMOVE,this.onMouseMove,this),this.app.mouse.off(pc.EVENT_MOUSEWHEEL,this.onMouseWheel,this),window.removeEventListener("mouseout",onMouseOut,!1)}))}this.app.mouse.disableContextMenu(),this.lookButtonDown=!1,this.panButtonDown=!1,this.lastPoint=new pc.Vec2},MouseInput.fromWorldPoint=new pc.Vec3,MouseInput.toWorldPoint=new pc.Vec3,MouseInput.worldDiff=new pc.Vec3,MouseInput.prototype.pan=function(t){var o=MouseInput.fromWorldPoint,e=MouseInput.toWorldPoint,i=MouseInput.worldDiff,s=this.entity.camera,n=this.orbitCamera.distance;s.screenToWorld(t.x,t.y,n,o),s.screenToWorld(this.lastPoint.x,this.lastPoint.y,n,e),i.sub2(e,o),this.orbitCamera.pivotPoint.add(i)},MouseInput.prototype.onMouseDown=function(t){switch(t.button){case pc.MOUSEBUTTON_LEFT:this.lookButtonDown=!0;break;case pc.MOUSEBUTTON_MIDDLE:case pc.MOUSEBUTTON_RIGHT:this.panButtonDown=!0}},MouseInput.prototype.onMouseUp=function(t){switch(t.button){case pc.MOUSEBUTTON_LEFT:this.lookButtonDown=!1;break;case pc.MOUSEBUTTON_MIDDLE:case pc.MOUSEBUTTON_RIGHT:this.panButtonDown=!1}},MouseInput.prototype.onMouseMove=function(t){pc.app.mouse;this.lookButtonDown?(this.orbitCamera.pitch-=t.dy*this.orbitSensitivity,this.orbitCamera.yaw-=t.dx*this.orbitSensitivity):this.panButtonDown&&this.pan(t),this.lastPoint.set(t.x,t.y)},MouseInput.prototype.onMouseWheel=function(t){this.orbitCamera.distance-=t.wheel*this.distanceSensitivity*(.1*this.orbitCamera.distance),t.event.preventDefault()},MouseInput.prototype.onMouseOut=function(t){this.lookButtonDown=!1,this.panButtonDown=!1};var KeyboardInput=pc.createScript("keyboardInput");KeyboardInput.prototype.initialize=function(){this.orbitCamera=this.entity.script.orbitCamera},KeyboardInput.prototype.postInitialize=function(){this.orbitCamera&&(this.startDistance=this.orbitCamera.distance,this.startYaw=this.orbitCamera.yaw,this.startPitch=this.orbitCamera.pitch,this.startPivotPosition=this.orbitCamera.pivotPoint.clone())},KeyboardInput.prototype.update=function(t){this.orbitCamera&&this.app.keyboard.wasPressed(pc.KEY_SPACE)&&(this.orbitCamera.reset(this.startYaw,this.startPitch,this.startDistance),this.orbitCamera.pivotPoint=this.startPivotPosition)};var ColorChange=pc.createScript("colorChange");ColorChange.attributes.add("name",{type:"string",title:"Body"}),ColorChange.attributes.add("Materials",{type:"asset",assetType:"material",title:"material Asset"}),ColorChange.attributes.add("text",{type:"entity"}),ColorChange.attributes.add("ColorName",{type:"string"}),ColorChange.attributes.add("ColorPositionAt",{type:"number"}),ColorChange.prototype.initialize=function(){this.entity.element.on("mousedown",this.onMouseDown,this)},ColorChange.prototype.onMouseDown=function(){this.text.element.text=this.ColorName;var t=this.text.element.entity.getLocalPosition();this.text.element.entity.setLocalPosition(t.x,this.ColorPositionAt,t.z);var e=this.Materials,o=this.name;this.app.root.findByTag(o).forEach((function(t){for(var o=t.model.meshInstances,a=0;a<o.length;++a){o[a].material=e.resource}}))};var SetColor=pc.createScript("setColor");SetColor.attributes.add("material",{type:"asset",assetType:"material"}),SetColor.prototype.initialize=function(){this.app.on("setcolor",(function(t){var e=this.material.resource;e.ambient=t,e.diffuse=t,e.update()}),this)};var CameraController=pc.createScript("cameraController");CameraController.attributes.add("secsIdleAutoOrbit",{type:"number",default:2,title:"Secs Idle Auto Orbit"}),CameraController.attributes.add("autoOrbitSpeed",{type:"number",default:2,title:"Auto orbit speed"}),CameraController.attributes.add("autoOrbitPitch",{type:"number",default:2,title:"Auto orbit pitch"}),CameraController.attributes.add("autoOrbitDistance",{type:"number",default:2,title:"Auto orbit distance"}),Object.defineProperty(CameraController.prototype,"distance",{get:function(){return this.orbitCamera.distance},set:function(t){this.orbitCamera.distance=t,this.secsSinceUserInput=0}}),Object.defineProperty(CameraController.prototype,"pitch",{get:function(){return this.orbitCamera.pitch},set:function(t){this.orbitCamera.pitch=t,this.secsSinceUserInput=0}}),Object.defineProperty(CameraController.prototype,"yaw",{get:function(){return this.orbitCamera.yaw},set:function(t){this.orbitCamera.yaw=t,this.secsSinceUserInput=0}}),CameraController.prototype.initialize=function(){this.orbitCamera=this.entity.script.orbitCamera,this.secsSinceUserInput=0},CameraController.prototype.update=function(t){this.secsSinceUserInput+=t,this.secsSinceUserInput>this.secsIdleAutoOrbit&&(this.orbitCamera.distance=pc.math.lerp(this.orbitCamera.distance,this.autoOrbitDistance,.05),this.orbitCamera.pitch=pc.math.lerp(this.orbitCamera.pitch,this.autoOrbitPitch,.05),this.orbitCamera.yaw+=this.autoOrbitSpeed*t)};var Interiorcamera=pc.createScript("interiorcamera");Interiorcamera.prototype.initialize=function(){this.app;var n=document.getElementById("tab0"),o=document.getElementById("tab1"),e=(document.getElementById("tab2"),document.getElementById("tab3")),a=this.app.root.findByTag("ExteriorCamera"),t=this.app.root.findByTag("InteriorCamera"),c=this.app.root.findByTag("WCCamera");n.onclick=function(){a.forEach((function(n){n.enabled=!0})),t.forEach((function(n){n.enabled=!1})),c.forEach((function(n){n.enabled=!1})),console.log("hola")},o.onclick=function(){a.forEach((function(n){n.enabled=!1})),t.forEach((function(n){n.enabled=!0})),c.forEach((function(n){n.enabled=!1})),console.log("hola")},e.onclick=function(){a.forEach((function(n){n.enabled=!1})),t.forEach((function(n){n.enabled=!1})),c.forEach((function(n){n.enabled=!0})),console.log("hola")}};var UpdateLavabo=pc.createScript("updateLavabo");UpdateLavabo.attributes.add("optionA",{type:"asset",assetType:"model"}),UpdateLavabo.attributes.add("optionB",{type:"asset",assetType:"model"}),UpdateLavabo.attributes.add("optionC",{type:"asset",assetType:"model"}),UpdateLavabo.prototype.initialize=function(){this.app;var e=document.getElementById("lavaboa"),o=document.getElementById("lavabob"),t=document.getElementById("lavaboc"),a=this.entity,d=this.optionA,l=this.optionB,n=this.optionC;e.onclick=function(){console.log("hola"),a.model.model!==d.resource&&(a.model.model=d.resource)},o.onclick=function(){a.model.model!==l.resource&&(console.log("hola DESDE AQUÍ"),a.model.model=l.resource)},t.onclick=function(){a.model.model!==n.resource&&(console.log("hola DESDE AQUÍ C"),a.model.model=n.resource)}},UpdateLavabo.prototype.update=function(e){};var UpdateAsset=pc.createScript("updateAsset");UpdateAsset.attributes.add("a",{type:"asset",assetType:"model"}),UpdateAsset.attributes.add("b",{type:"asset",assetType:"model"}),UpdateAsset.attributes.add("c",{type:"asset",assetType:"model"}),UpdateAsset.attributes.add("MaterialA",{type:"asset",assetType:"material"}),UpdateAsset.attributes.add("MaterialB",{type:"asset",assetType:"material"}),UpdateAsset.attributes.add("MAterialC",{type:"asset",assetType:"material"}),UpdateAsset.prototype.initialize=function(){this.app;var e=document.getElementById("boton1"),t=document.getElementById("boton2"),s=document.getElementById("boton3"),a=this.entity,o=(this.a,this.b),d=this.c,i=this.MaterialA;this.MaterialB,this.MaterialC;e.onclick=function(){a.model.model!==o.resource&&(console.log("hola"),a.model.model=o.resource)},t.onclick=function(){a.model.model!==d.resource&&(console.log("hola DESDE AQUÍ"),a.model.model=d.resource)},s.onclick=function(){a.forEach((function(e){for(var t=e.model.meshInstances,s=0;s<t.length;++s){t[s].material=i.resource}}))}},UpdateAsset.prototype.update=function(e){};var UpdateInodoro=pc.createScript("updateInodoro");UpdateInodoro.attributes.add("optionA",{type:"asset",assetType:"model"}),UpdateInodoro.attributes.add("optionB",{type:"asset",assetType:"model"}),UpdateInodoro.attributes.add("optionC",{type:"asset",assetType:"model"}),UpdateInodoro.prototype.initialize=function(){this.app;var o=document.getElementById("Inodoroa"),e=document.getElementById("Inodorob"),t=document.getElementById("Inodoroc"),d=this.entity,n=this.optionA,l=this.optionB,r=this.optionC;o.onclick=function(){console.log("hola"),d.model.model!==n.resource&&(d.model.model=n.resource)},e.onclick=function(){d.model.model!==l.resource&&(console.log("hola DESDE AQUÍ"),d.model.model=l.resource)},t.onclick=function(){d.model.model!==r.resource&&(console.log("hola DESDE AQUÍ C"),d.model.model=r.resource)}},UpdateInodoro.prototype.update=function(o){};var AutoDistance=pc.createScript("autoDistance");AutoDistance.attributes.add("defaultDist",{type:"number",default:4}),AutoDistance.attributes.add("zDist",{type:"number",default:3.3}),AutoDistance.attributes.add("xDist",{type:"number",default:2.2}),AutoDistance.attributes.add("parentMovement",{type:"number",default:1.5}),AutoDistance.attributes.add("speed",{type:"number",default:1}),AutoDistance.attributes.add("distMult",{type:"number",default:1}),AutoDistance.attributes.add("zoomMult",{type:"number",default:1});var smoothstep=function(t,e,s){return s=s*s*(3-2*s),pc.math.lerp(t,e,s)};AutoDistance.prototype.initialize=function(){var t=this.app;this.weight=1,this.lpos2=new pc.Vec3,t._autoDistance=this,this.entity.camera.horizontalFov=!0,this.entity.camera.fov=this.entity.camera.fov/this.zoomMult},AutoDistance.prototype.postUpdate=function(t){var e=t*this.speed,s=this.entity.forward,i=Math.abs(s.z),a=Math.abs(s.x),o=Math.abs(s.y),n=smoothstep(this.defaultDist,this.xDist,a);n=smoothstep(n,this.zDist,i)*this.distMult;var u=this.entity.getLocalPosition();u.z=smoothstep(u.z,n,e*this.weight),this.entity.setLocalPosition(u),this.lpos2.z=smoothstep(this.lpos2.z,-s.z*this.parentMovement,e*this.weight),this.lpos2.y=smoothstep(this.lpos2.y,s.y*(1.25*o+1)*(o*-i+1),e*this.weight),this.entity.parent.setLocalPosition(this.lpos2)};var LookCamera=pc.createScript("lookCamera");LookCamera.attributes.add("mouseLookSensitivity",{type:"number",default:0,title:"Mouse Look Sensitivity"}),LookCamera.attributes.add("touchLookSensitivity",{type:"number",default:0,title:"Touch Look Sensitivity"}),LookCamera.attributes.add("snappinessFactor",{type:"number",default:.1,title:"Snappiness Factor",description:"Lower is faster"}),LookCamera.prototype.initialize=function(){this._tempQuat1=new pc.Quat,this._tempQuat2=new pc.Quat,this._tempVec3_1=new pc.Vec3;var t=this.entity.getLocalRotation();this.ey=this.getYaw(t)*pc.math.RAD_TO_DEG,this.ex=this.getPitch(t,this.ey)*pc.math.RAD_TO_DEG,this.targetEx=this.ex,this.targetEy=this.ey,this.moved=!1,this.app.mouse.disableContextMenu(),this.lastTouchPosition=new pc.Vec2,this.addEventCallbacks(),this.on("destroy",(function(){this.removeEventCallbacks()}),this)},LookCamera.prototype.addEventCallbacks=function(){this.app.mouse&&this.app.mouse.on(pc.EVENT_MOUSEMOVE,this.onMouseMove,this),this.app.touch&&(this.app.touch.on(pc.EVENT_TOUCHSTART,this.onTouchStart,this),this.app.touch.on(pc.EVENT_TOUCHMOVE,this.onTouchMove,this))},LookCamera.prototype.removeEventCallbacks=function(){this.app.mouse&&this.app.mouse.off(pc.EVENT_MOUSEMOVE,this.onMouseMove,this),this.app.touch&&(this.app.touch.off(pc.EVENT_TOUCHSTART,this.onTouchStart,this),this.app.touch.off(pc.EVENT_TOUCHMOVE,this.onTouchMove,this))},LookCamera.prototype.update=function(t){var o=1;this.snappinessFactor>0&&(o=t/this.snappinessFactor),this.ex=pc.math.lerp(this.ex,this.targetEx,o),this.ey=pc.math.lerp(this.ey,this.targetEy,o),this.entity.setLocalEulerAngles(this.ex,this.ey,0)},LookCamera.prototype.moveCamera=function(t,o,e){this.moved?(this.targetEx+=o*e,this.targetEx=pc.math.clamp(this.targetEx,-90,90),this.targetEy+=t*e):this.moved=!0},LookCamera.prototype.onMouseMove=function(t){this.app.mouse.isPressed(pc.MOUSEBUTTON_LEFT)&&this.moveCamera(t.dx,t.dy,this.mouseLookSensitivity)},LookCamera.prototype.onTouchStart=function(t){var o=t.touches[0];this.lastTouchPosition.set(o.x,o.y)},LookCamera.prototype.onTouchMove=function(t){var o=t.touches[0];this.moveCamera(o.x-this.lastTouchPosition.x,o.y-this.lastTouchPosition.y,this.touchLookSensitivity),this.lastTouchPosition.set(o.x,o.y)},LookCamera.prototype.getYaw=function(){var t=this.entity.forward.clone();return Math.atan2(-t.x,-t.z)},LookCamera.prototype.getPitch=function(t,o){var e=this._tempQuat1,i=this._tempQuat2;i.setFromEulerAngles(0,-o,0),e.mul2(i,t);var s=this._tempVec3_1;return e.transformVector(pc.Vec3.FORWARD,s),Math.atan2(s.y,-s.z)};var UpdateGrifo=pc.createScript("updateGrifo");UpdateGrifo.attributes.add("optionA",{type:"asset",assetType:"model"}),UpdateGrifo.attributes.add("optionB",{type:"asset",assetType:"model"}),UpdateGrifo.attributes.add("optionC",{type:"asset",assetType:"model"}),UpdateGrifo.prototype.initialize=function(){this.app;var e=document.getElementById("grifoa"),o=document.getElementById("grifob"),t=document.getElementById("grifoc"),i=this.entity,d=this.optionA,l=this.optionB,r=this.optionC;e.onclick=function(){console.log("hola"),i.model.model!==d.resource&&(i.model.model=d.resource)},o.onclick=function(){i.model.model!==l.resource&&(console.log("hola DESDE AQUÍ"),i.model.model=l.resource)},t.onclick=function(){i.model.model!==r.resource&&(console.log("hola DESDE AQUÍ C"),i.model.model=r.resource)}},UpdateGrifo.prototype.update=function(e){};var UpdateFloor=pc.createScript("updateFloor");UpdateFloor.attributes.add("materialA",{type:"asset",assetType:"material"}),UpdateFloor.attributes.add("materialB",{type:"asset",assetType:"material"}),UpdateFloor.attributes.add("materialC",{type:"asset",assetType:"material"}),UpdateFloor.prototype.initialize=function(){this.app;var t=document.getElementById("sueloA"),e=document.getElementById("sueloB"),a=document.getElementById("sueloC"),o=this.entity,r=(this.a,this.b,this.c,this.materialA),i=this.materialB,l=this.materialC;t.onclick=function(){o.forEach((function(t){for(var e=o.model.model.meshInstances,a=0;a<e.length;++a){e[a].material=r.resource}}))},e.onclick=function(){o.forEach((function(t){for(var e=o.model.model.meshInstances,a=0;a<e.length;++a){e[a].material=i.resource}}))},a.onclick=function(){o.forEach((function(t){for(var e=o.model.model.meshInstances,a=0;a<e.length;++a){e[a].material=l.resource}}))}},UpdateFloor.prototype.update=function(t){};pc.script.createLoadingScreen((function(e){var t,a;t=["body {","    background-color: #283538;","}","","#application-splash-wrapper {","    position: absolute;","    top: 0;","    left: 0;","    height: 100%;","    width: 100%;","    background-color: #283538;","}","","#application-splash {","    position: absolute;","    top: calc(50% - 28px);","    width: 264px;","    left: calc(50% - 132px);","}","","#application-splash img {","    width: 100%;","}","","#progress-bar-container {","    margin: 20px auto 0 auto;","    height: 2px;","    width: 100%;","    background-color: #1d292c;","}","","#progress-bar {","    width: 0%;","    height: 100%;","    background-color: #fff;","}","","@media (max-width: 480px) {","    #application-splash {","        width: 170px;","        left: calc(50% - 85px);","    }","}"].join("\n"),(a=document.createElement("style")).type="text/css",a.styleSheet?a.styleSheet.cssText=t:a.appendChild(document.createTextNode(t)),document.head.appendChild(a),function(){var e=document.createElement("div");e.id="application-splash-wrapper",document.body.appendChild(e);var t=document.createElement("div");t.id="application-splash",e.appendChild(t),t.style.display="none";var a=document.createElement("img");a.src="https://wisebuild.es/wp-content/uploads/2020/06/logo_wise_buil_Blanco-1-1024x295.png",t.appendChild(a),a.onload=function(){t.style.display="block"};var o=document.createElement("div");o.id="progress-bar-container",t.appendChild(o);var n=document.createElement("div");n.id="progress-bar",o.appendChild(n)}(),e.on("preload:end",(function(){e.off("preload:progress")})),e.on("preload:progress",(function(e){var t=document.getElementById("progress-bar");t&&(e=Math.min(1,Math.max(0,e)),t.style.width=100*e+"%")})),e.on("start",(function(){var e=document.getElementById("application-splash-wrapper");e.parentElement.removeChild(e)}))}));var world2reflMirror,Mirror=pc.createScript("mirror");Mirror.attributes.add("primitive",{type:"boolean"}),Mirror.attributes.add("density",{type:"number"}),Mirror.attributes.add("onlyTag",{type:"string"}),Mirror.attributes.add("shaderPS",{type:"asset",assetType:"shader"});var planePosWM,planeNormalWM,planeAV,planeBV,planeCV,planeDV,tmpView=new pc.Mat4,tmpView2=new pc.Mat4,tmpView3=new pc.Mat4,planeQ=new pc.Vec4,planeV=new pc.Vec4,planePosV=new pc.Vec3,planeNormalV=new pc.Vec3,projInv=new pc.Mat4,pointsV=[new pc.Vec4,new pc.Vec4,new pc.Vec4,new pc.Vec4],prevGlobalMatrix=new pc.Mat4,tmpQuat=new pc.Quat,mirrorLookAt=new pc.Vec3,localPlayerPos=new pc.Vec3,afterTransitionPos=new pc.Vec3,reflectedCamPos=new pc.Vec3,reflectedCamDir=new pc.Vec3,invPortalPlane=new pc.Vec3,activeMirror=null,mirrorFrustum=new pc.Frustum,tempSphereMirror={center:null,radius:0},mirrorBit=0,atf={},MAX3D_SCALE=1,MIRRORSTATE_FAR=0,MIRRORSTATE_NEAR=1,MIRRORSTATE_TOUCH=2,MIRRORSTATE_SWITCH=3,MIRRORSTATE_POST=4,MIRRORSTATE_OFF=5,mirrorTransition=0,mirrorDefaultFov=0;function reflectionMatrix(e,t,r,a){var i=new pc.Mat4;return i.data[0]=1-2*e*e,i.data[1]=-2*e*t,i.data[2]=-2*e*r,i.data[3]=-2*e*a,i.data[4]=-2*e*t,i.data[5]=1-2*t*t,i.data[6]=-2*t*r,i.data[7]=-2*t*a,i.data[8]=-2*e*r,i.data[9]=-2*t*r,i.data[10]=1-2*r*r,i.data[11]=-2*r*a,i.data[12]=0,i.data[13]=0,i.data[14]=0,i.data[15]=1,i.transpose(),i}function customTransformFuncMirror(e,t){var r=this.node.getPosition(),a=this.node.getRotation();e.setTRS(r,a,pc.Vec3.ONE),e.mul2(world2reflMirror,e)}function customProjFuncMirror(e,t){if(this.projection===pc.PROJECTION_PERSPECTIVE)e.setPerspective(this.fov,this.aspectRatio,this.nearClip,this.farClip,this.horizontalFov);else{var r=0*this.aspectRatio;e.setOrtho(-r,r,-0,0,this.nearClip,this.farClip)}var a=this.node.getPosition(),i=this.node.getRotation();tmpView.setTRS(a,i,pc.Vec3.ONE).invert(),tmpView.transformPoint(planePosWM,planePosV),tmpView.transformVector(planeNormalWM,planeNormalV).normalize(),planeAV=planeNormalV.x,planeBV=planeNormalV.y,planeCV=planeNormalV.z,planeDV=-planePosV.dot(planeNormalV),planeV.set(planeAV,planeBV,planeCV,planeDV),projInv.copy(e).invert(),planeQ.set(sgn(planeAV),sgn(planeBV),1,1),projInv.transformVec4(planeQ,planeQ),planeV.scale(2/planeV.dot(planeQ));var s=e.data;s[2]=planeV.x-s[3],s[6]=planeV.y-s[7],s[10]=planeV.z-s[11],s[14]=planeV.w-s[15]}function sgn(e){return e>0?1:e<0?-1:0}Mirror.prototype.isVisible=function(e){var t,r,a,i=e.frustum,s=this.pointsW,n=e.projectionMatrix;for(i.setFromMat4(n),r=0;r<6;r++){if(t=i.planes[r][0]*s[0].x+i.planes[r][1]*s[0].y+i.planes[r][2]*s[0].z+i.planes[r][3]<=0)for(a=1;a<4;a++)if(i.planes[r][0]*s[a].x+i.planes[r][1]*s[a].y+i.planes[r][2]*s[a].z+i.planes[r][3]>0){t=!1;break}if(t)return!1}return!0},Mirror.prototype.initialize=function(){var e,t,r,a,i=this.app,s=i.graphicsDevice;pc.shaderChunks;this.cam=i.root.findByName("Camera").camera,this.nearDist=3;var n=atf.mirrorRt;if(!n){var o=this.entity.model.model.meshInstances[0].material;o.customFragmentShader=this.shaderPS.resource,o.blendType=pc.BLEND_NORMAL,o.update(),pc.mirrorMaterial=o,pc.fallbackMirrorMaterial=o.clone(),this.setSky(2);var p=pc.PIXELFORMAT_R8_G8_B8_A8;s.webgl2&&s.extTextureFloatRenderable?p=pc.PIXELFORMAT_111110F:s.extTextureHalfFloatRenderable&&s.extTextureHalfFloatLinear&&(p=pc.PIXELFORMAT_RGBA16F);var l=new pc.Texture(s,{width:s.width,height:s.height,format:p,autoMipmap:!1});l.addressU=pc.ADDRESS_CLAMP_TO_EDGE,l.addressV=pc.ADDRESS_CLAMP_TO_EDGE,l.magFilter=pc.FILTER_LINEAR,l.minFilter=pc.FILTER_LINEAR,atf.mirrorRt=n=new pc.RenderTarget(s,l,{samples:4,depth:!0,stencil:!0}),s.scope.resolve("mirrorTex").setValue(l)}this.rt=n,this.entity.model.model.meshInstances[0].setParameter("mirrorDepthOffset",0),this.entity.model.model.meshInstances[0].setParameter("mirrorDensity",0===this.density?1:this.density);var c=this.primitive?this.entity:this.entity.children[0].children[0];this.planePosW=c.getPosition(),this.planeNormalW=c.forward,this.planeRightW=c.right,this.planeNormalWOrig=this.planeNormalW.clone(),e=this.planeNormalW.x,t=this.planeNormalW.y,r=this.planeNormalW.z,a=-this.planePosW.dot(this.planeNormalW),this.world2refl=reflectionMatrix(e,t,r,a),this.planeDW=a,this.maxXdiff=.5*c.getLocalScale().x*MAX3D_SCALE;var h,d=i.scene.drawCalls;this.dipsReflect=[],this.dipsReflect2=[];var m=this.entity.model.model.meshInstances[0].material,f=this.entity.name+"_off",u=this.onlyTag,M=void 0!==u&&""!==u&&null!==u;for(h=0;h<d.length;h++)if(d[h].node){if(d[h].material===m)continue;for(var V=d[h].node,y=!1,w=!1,R=!1;V;)V.tags&&V.tags.has(f)&&(y=!0),V.tags&&V.tags.has("DontMirror")&&(w=!0),M&&V.tags&&V.tags.has(u)&&(R=!0),V=V.parent;d[h].node.getWorldTransform(),d[h].aabb,M?(R||d[h].command)&&this.dipsReflect.push(d[h]):(y||w||this.dipsReflect.push(d[h]),this.dipsReflect2.push(d[h]))}var T,g,A=this,addAsyncEntity=function(e){var t=e.model.asset;if(t){var r=i.assets.get(t);r&&(r.once("load",(function(){for(g=e.model.model.meshInstances,T=0;T<g.length;T++)A.dipsReflect.push(g[T]),A.dipsReflect2.push(g[T])})),i.assets.load(r))}},P=i.root.findByTag("MirrorOnly");for(h=0;h<P.length;h++)if(P[h].enabled)if(P[h].model.model)for(g=P[h].model.model.meshInstances,T=0;T<g.length;T++)this.dipsReflect.push(g[T]),this.dipsReflect2.push(g[T]);else addAsyncEntity(P[h]);for(P=i.root.findByTag(this.entity.name+"_on"),h=0;h<P.length;h++)if(P[h].enabled)for(g=P[h].model.model.meshInstances,T=0;T<g.length;T++)this.dipsReflect.push(g[T]);this.objectsOn=P,this.objectsOff=i.root.findByTag(f),this.init=!1,pc.mirrorCount?this.first=!1:(pc.mirrorCount=0,pc.mirrorsToRender=0,pc.mirrorList=[],pc.dipsMirror=[],pc.distortionNearFade=1,pc.isMirrorClose=!1,pc.mirrorsDrawn=0,this.first=!0),pc.mirrorCount++,pc.mirrorList.push(this);var v=this.entity.model.model.meshInstances[0],W=new pc.BasicMaterial;W.redWrite=!1,W.greenWrite=!1,W.blueWrite=!1,W.alphaWrite=!1,W.depthWrite=!1,W.depthTest=!1,W.stencilBack=W.stencilFront=new pc.StencilParameters({zpass:pc.STENCILOP_REPLACE,ref:pc.mirrorCount});var E=new pc.MeshInstance(v.node,v.mesh,W);pc.dipsMirror.push(E),this.bit=pc.mirrorCount,this.srect={x:0,y:0,width:1,height:1},this.pointsW=[new pc.Vec3,new pc.Vec3,new pc.Vec3,new pc.Vec3];var C=c.getLocalScale(),_=c.right,S=c.up,b=new pc.Vec3;for(this.pointsW[0].copy(_).scale(.5*C.x*MAX3D_SCALE),b.copy(S).scale(.5*C.y*MAX3D_SCALE),this.pointsW[0].add(b).add(this.planePosW),this.pointsW[1].copy(_).scale(-.5*C.x*MAX3D_SCALE),b.copy(S).scale(-.5*C.y*MAX3D_SCALE),this.pointsW[1].add(b).add(this.planePosW),this.pointsW[2].copy(_).scale(-.5*C.x*MAX3D_SCALE),b.copy(S).scale(.5*C.y*MAX3D_SCALE),this.pointsW[2].add(b).add(this.planePosW),this.pointsW[3].copy(S).scale(-.5*C.y*MAX3D_SCALE),b.copy(_).scale(.5*C.x*MAX3D_SCALE),this.pointsW[3].add(b).add(this.planePosW),this.pointsW4=[new pc.Vec4,new pc.Vec4,new pc.Vec4,new pc.Vec4],h=0;h<4;h++)this.pointsW4[h].x=this.pointsW[h].x,this.pointsW4[h].y=this.pointsW[h].y,this.pointsW4[h].z=this.pointsW[h].z,this.pointsW4[h].w=1;this.clear={flags:0},this.clearFirst={color:[1,0,0,1],depth:1,stencil:0,flags:pc.CLEARFLAG_DEPTH|pc.CLEARFLAG_STENCIL},this.state=MIRRORSTATE_FAR,this.constDist=s.scope.resolve("distortionNearFade"),this.constTrans=s.scope.resolve("mirrorTransition");var L=v.aabb.getMin(),x=v._aabb.getMax(),F=[new pc.Vec3,new pc.Vec3,new pc.Vec3,new pc.Vec3,new pc.Vec3,new pc.Vec3,new pc.Vec3,new pc.Vec3];F[0].set(L.x,L.y,L.z),F[1].set(x.x,L.y,L.z),F[2].set(x.x,x.y,L.z),F[3].set(L.x,x.y,L.z),F[4].set(L.x,L.y,x.z),F[5].set(x.x,L.y,x.z),F[6].set(x.x,x.y,x.z),F[7].set(L.x,x.y,x.z),this.bp=F,this.mConst=this.app.graphicsDevice.scope.resolve("world2refl");var I=this.cam,D=this.app.scene.layers.getLayerByName("Mirror"),N=[D],preFunction=function(){planePosWM=A.planePosW,planeNormalWM=A.planeNormalW,world2reflMirror=A.world2refl,I.calculateTransform=customTransformFuncMirror,I.calculateProjection=customProjFuncMirror,I.flipFaces=!0,A.app.renderer.updateCameraFrustum(I.camera)},postFunction=function(){I.calculateTransform=null,I.calculateProjection=null,I.flipFaces=!1,A.app.renderer.updateCameraFrustum(I.camera)};for(h=0;h<N.length;h++)N[h].renderTarget=this.rt,N[h].onPreCull=N[h].onPreRender=preFunction,N[h].onPostCull=N[h].onPostRender=postFunction,N[h].enabled=!0;this.mirrorLayers=N,this.app.scene.on("set:skybox",(function(){D.addMeshInstances(A.app.scene.skyboxModel.meshInstances)})),this.wasVisible=!0,this.app.graphicsDevice.on("resizecanvas",(function(){atf={},this._init=!1}),this)},Mirror.prototype.update=function(e){if(this._init){1===this._init&&(this.initialize(),this._init=2);var t=this.isVisible(this.cam);if(t!==this.wasVisible){for(var r=0;r<this.mirrorLayers.length;r++)this.mirrorLayers[r].enabled=t;this.wasVisible=t}}else this._init=1},Mirror.prototype.setSky=function(e){this.skyIsOn=e,pc.fallbackMirrorMaterial&&(pc.fallbackMirrorMaterial.customFragmentShader=(e?"#define SKY\n":"")+"#define SIMPLE\n"+pc.shaderChunks.rgbmPS+this.shaderPS.resource,pc.fallbackMirrorMaterial.update())};var UpdateMirror=pc.createScript("updateMirror");UpdateMirror.attributes.add("optionA",{type:"asset",assetType:"model"}),UpdateMirror.attributes.add("optionB",{type:"asset",assetType:"model"}),UpdateMirror.attributes.add("optionC",{type:"asset",assetType:"model"}),UpdateMirror.prototype.initialize=function(){this.app;var e=document.getElementById("mirrora"),o=document.getElementById("mirrorb"),t=document.getElementById("mirrorc"),r=this.entity,i=this.optionA,d=this.optionB,l=this.optionC;e.onclick=function(){console.log("hola"),r.model.model!==i.resource&&(r.model.model=i.resource)},o.onclick=function(){r.model.model!==d.resource&&(console.log("hola DESDE AQUÍ"),r.model.model=d.resource)},t.onclick=function(){r.model.model!==l.resource&&(console.log("hola DESDE AQUÍ C"),r.model.model=l.resource)}},UpdateMirror.prototype.update=function(e){};