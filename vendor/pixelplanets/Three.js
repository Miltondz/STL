import {Clock, Group, Scene, WebGLRenderer} from "three";

export function createScene() {
    return new Scene();
}

export function createClock() {
    return new Clock();
}

export function createWebGlRenderer() {
    return new WebGLRenderer({ antialias: false, alpha: true });
}

export function createGroup() {
    return new Group();
}
