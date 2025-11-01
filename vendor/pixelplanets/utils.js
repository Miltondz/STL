import { createEarthPlanet } from "./Planets/earthPlanet.js";

export function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export function flip() {
    return Math.random() > 0.5
}

export function randomPointOnSphere() {
    var u = Math.random();
    var v = Math.random();
    var theta = 2 * Math.PI * u;
    var phi = Math.acos(2 * v - 1);
    var x = 0 + (1 * Math.sin(phi) * Math.cos(theta));
    var y = 0 + (1 * Math.sin(phi) * Math.sin(theta));
    var z = 0 + (1 * Math.cos(phi));
    return { "x": x, "y": y, "z": z };
}

export function generatePlanetByType(type) {
    switch (type) {
        case "Earth Planet":
        default:
            return createEarthPlanet()
    }
}
