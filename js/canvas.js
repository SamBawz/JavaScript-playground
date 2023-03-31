const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
let loaderIconEle = document.getElementById("loader-icon");
let loaderTextEle = document.getElementById("loader-text");

let ConstellationParticleLinkDistance;
let animationId;
let constellationParticlesArray = [];
let normalParticlesArray = [];
let trailAlpha = 0.08;
let mousePos = [];

import {ConstellationParticle, TriangleParticle, SubTriangleParticle, PolyPoint} from "./particles.js";

window.onload = function() {
    canvas.width = innerWidth;
    canvas.height = globalThis.screen.availHeight;
    console.log(canvas)
}

function init(alpha) {
    //Reset
    loaderIconEle.style.transform = "scale(0)";
    loaderTextEle.style.opacity = "0";
    trailAlpha = alpha;
    normalParticlesArray = [];
    constellationParticlesArray = [];
}

function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

let playing = false;
function animate() {
    animationId = requestAnimationFrame(animate);
    context.globalAlpha = trailAlpha;
    context.clearRect(0, 0, canvas.width, canvas.height);

    //Particles that do not require special drawing animations
    for (let i = 0; i < normalParticlesArray.length; i++) {
        normalParticlesArray.globalAlpha = normalParticlesArray[i].opacity;
        normalParticlesArray[i].draw();
        normalParticlesArray[i].update();
        if (normalParticlesArray[i].opacity < 0 || normalParticlesArray[i].size > 3500) {
            normalParticlesArray.splice(i, 1);
        }
    }

    //Constellation particles
    for (let i = 0; i < constellationParticlesArray.length; i++) {
        for (let secondIndex = 0; secondIndex < constellationParticlesArray.length; secondIndex++) {
            if(i !== secondIndex) {
                const distance = Math.hypot(constellationParticlesArray[i].x - constellationParticlesArray[secondIndex].x, constellationParticlesArray[i].y - constellationParticlesArray[secondIndex].y);
                if (distance < ConstellationParticleLinkDistance) {
                    context.strokeStyle = constellationParticlesArray[i].color;
                    //Was first / 2
                    context.lineWidth = constellationParticlesArray[i].size / 1.5;
                    context.beginPath();
                    context.moveTo(constellationParticlesArray[i].x, constellationParticlesArray[i].y);
                    context.lineTo(constellationParticlesArray[secondIndex].x, constellationParticlesArray[secondIndex].y);
                    context.stroke();
                }
            }
        }
        constellationParticlesArray[i].update();
    }

}

function playAnimation() {
    if(!playing) {
        animate()
        playing = true
    }
}
playAnimation();

function stopAnimation() {
    cancelAnimationFrame(animationId)
    playing = false;
}

//EVENT LISTENERS

canvas.addEventListener("mousemove", (e) => {
    mousePos.x = e.offsetX;
    mousePos.y = e.offsetY;
})

let constellationButtonEle = document.getElementById("constellation");
constellationButtonEle.addEventListener("click", () => {
    //Adjust all values to be the same regardless of screen size
    ConstellationParticleLinkDistance = innerWidth / 25.6;
    let constellationParticleSize = innerWidth / 1280;
    let constellationParticleSpeed = innerWidth / 5120;

    init(0.08);
    //Orginal amount was 150. This is not too distracting or too intense for smaller screens
    for(let i = 0; i < 250; i++) {
        constellationParticlesArray.push(new ConstellationParticle(constellationParticleSpeed, constellationParticleSize, "white"));
    }
})

let loadOneButtonEle = document.getElementById("load-one");
loadOneButtonEle.addEventListener("click", () => {
    init(1);

    let alphaParticle = new TriangleParticle(canvas.width / 2, canvas.height / 2, 1, true, canvas.height / 3.5, true, false, undefined, true)
    normalParticlesArray.push(alphaParticle);
    loaderIconEle.style.transform = "scale(1)";
    setTimeout(() => {
        loaderTextEle.style.opacity = "1";
    }, 1000)

    alphaParticle.maxSize = loaderIconEle.offsetHeight * 2;
    alphaParticle.rotateSpeed = 2;
    alphaParticle.growSpeed = 30;
    setTimeout(() => {
        alphaParticle.subEmitter = false;
        alphaParticle.rotating = true;
        //Ook een enorm vet effect
        //defaultGrowSpeed = 10;
        //maxSize = loaderCanvas.width * 0.2;
        let spawner  = setInterval(() => {
            normalParticlesArray.push(new TriangleParticle(alphaParticle.x, alphaParticle.y, alphaParticle.size, true, canvas.width * 2, false, false, alphaParticle.rotation));
        }, 100)
        setTimeout(() => {
            clearInterval(spawner)
            //alphaParticle.growSpeed = 50;
            //alphaParticle.fillColor = "white";
            //alphaParticle.filled = true;
            //alphaParticle.maxSize = canvas.width * 2;
            //alphaParticle.size = 0;
            alphaParticle.rotating = false;
            setTimeout(() => {
                init(0.01);
                //normalParticlesArray = [];
            }, 3000)
        }, 3000)
    }, 100)
})


export {mousePos, canvas, context, normalParticlesArray}