import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class EkuRenderer {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0, 0);
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x94a4b8, 2.1));
    const key = new THREE.DirectionalLight(0xffffff, 2.0);
    key.position.set(-150, 250, 400);
    this.scene.add(key);
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 2000);
    this.camera.position.z = 500;
    this.actor = new THREE.Group();
    this.scene.add(this.actor);
    this.bones = new Map();
    this.rest = new Map();
    this.clock = 0;
    this.resize();
  }
  resize() {
    this.staticSignature = null;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.size = this.width < 700 ? 145 : 200;
    this.renderer.setSize(this.width, this.height);
    Object.assign(this.camera, {
      left: -this.width / 2,
      right: this.width / 2,
      top: this.height / 2,
      bottom: -this.height / 2,
    });
    this.camera.updateProjectionMatrix();
    if (this.model) this.model.scale.setScalar(this.size / this.modelHeight);
  }
  async load(url, onProgress) {
    const manager = new THREE.LoadingManager();
    let assetFailed = false;
    manager.onError = () => {
      assetFailed = true;
    };
    const gltf = await new GLTFLoader(manager).loadAsync(url, (event) => {
      if (event.total)
        onProgress(Math.round((event.loaded / event.total) * 100));
    });
    if (assetFailed) throw new Error("EKU texture failed to load");
    this.model = gltf.scene;
    const box = new THREE.Box3().setFromObject(this.model);
    this.modelHeight = box.max.y - box.min.y;
    this.model.position.y = -box.min.y;
    this.model.traverse((object) => {
      if (object.isBone) {
        this.bones.set(object.name, object);
        this.rest.set(object.name, object.quaternion.clone());
      }
      if (object.isMesh) {
        object.frustumCulled = false;
        object.castShadow = false;
      }
    });
    this.actor.add(this.model);
    this.resize();
  }
  bone(suffix) {
    return [...this.bones.values()].find((b) => b.name.endsWith(suffix));
  }
  aim(suffix, childSuffix, x, y, z) {
    const bone = this.bone(suffix),
      child = this.bone(childSuffix);
    if (!bone || !child) return;
    this.actor.updateMatrixWorld(true);
    const from = child
      .getWorldPosition(new THREE.Vector3())
      .sub(bone.getWorldPosition(new THREE.Vector3()))
      .normalize();
    const desired = new THREE.Vector3(x, y, z)
      .normalize()
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.actor.rotation.y);
    const delta = new THREE.Quaternion().setFromUnitVectors(from, desired);
    const parent = bone.parent.getWorldQuaternion(new THREE.Quaternion());
    bone.quaternion.premultiply(
      parent.clone().invert().multiply(delta).multiply(parent),
    );
  }
  pose(state, time, direction = 1) {
    if (!this.model) return;
    for (const [name, bone] of this.bones)
      bone.quaternion.copy(this.rest.get(name));
    this.actor.rotation.y =
      state === "walk" ? direction * 0.45 : state === "climb" ? Math.PI : 0;
    const gait = Math.sin(time * 7);
    for (const [side, sign] of [
      ["L", 1],
      ["R", -1],
    ]) {
      let upper = [sign * 0.15, -1, 0],
        fore = [sign * 0.05, -1, 0.08];
      let thigh = [sign * 0.04, -1, 0],
        calf = [0, -1, 0.02];
      if (state === "walk") {
        upper = [sign * 0.15, -1, gait * sign * 0.4];
        fore = [sign * 0.05, -1, 0.2];
        thigh = [sign * 0.04, -1, -gait * sign * 0.3];
        calf = [0, -1, Math.max(0, gait * sign) * 0.4];
      }
      if (state === "climb") {
        upper = [sign * 0.4, 0.9 + gait * sign * 0.3, 0.2];
        fore = [sign * 0.15, 1, 0.3];
        thigh = [sign * 0.35, -0.8, 0.3 + gait * sign * 0.25];
        calf = [sign * 0.1, -1, -0.4];
      }
      if (state === "read" || state === "pickup") {
        upper = [sign * 0.35, -0.75, 0.4];
        fore = [-sign * 0.2, 0.45, 1];
      }
      if (state === "wave" && side === "R") {
        upper = [-0.8, 0.4, 0];
        fore = [Math.sin(time * 9) * 0.4, 1, 0.2];
      }
      this.aim(`_${side}_UpperArm`, `_${side}_Forearm`, ...upper);
      this.aim(`_${side}_Forearm`, `_${side}_Hand`, ...fore);
      this.aim(`_${side}_Thigh`, `_${side}_Calf`, ...thigh);
      this.aim(`_${side}_Calf`, `_${side}_Foot`, ...calf);
    }
    const head = this.bone("_Head1");
    if (head)
      head.quaternion.multiply(
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler(
            state === "read" || state === "pickup" ? -0.14 : 0,
            Math.sin(time * 0.7) * 0.055,
            0,
          ),
        ),
      );
    const tail = this.bones.get("Tail");
    if (tail)
      tail.quaternion.multiply(
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, Math.sin(time * 1.5) * 0.15, 0),
        ),
      );
  }
  draw(position, state, time, direction, still = false) {
    const signature = `${position.x}:${position.y}:${state}`;
    if (still && this.staticSignature === signature) return;
    this.staticSignature = still ? signature : null;
    this.actor.position.set(
      position.x - this.width / 2,
      this.height / 2 - position.y + (still ? 0 : Math.sin(time * 2) * 1.2),
      0,
    );
    this.pose(state, still ? 0 : time, direction);
    this.renderer.render(this.scene, this.camera);
  }
  hand() {
    const left = this.bone("_L_Hand");
    const right = this.bone("_R_Hand");
    if (!left || !right) return null;
    this.actor.updateMatrixWorld(true);
    const position = left
      .getWorldPosition(new THREE.Vector3())
      .add(right.getWorldPosition(new THREE.Vector3()))
      .multiplyScalar(0.5)
      .project(this.camera);
    return {
      x: ((position.x + 1) * this.width) / 2,
      y: ((-position.y + 1) * this.height) / 2,
    };
  }
  dispose() {
    this.renderer.dispose();
  }
}
