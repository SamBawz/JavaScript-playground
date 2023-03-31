import {mousePos, canvas, context, normalParticlesArray} from "./canvas.js";

class ConstellationParticle {
    constructor(speed, size, color) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.velocity = {};
        Math.random() > 0.5 ? this.velocity.x = Math.random() * speed : this.velocity.x = Math.random() * -speed;
        //Scrolling effect
        this.velocity.x += 1;
        Math.random() > 0.5 ? this.velocity.y = Math.random() * speed : this.velocity.y = Math.random() * -speed;
        this.size = size;
        this.color = color;
        this.density = (Math.random() * 5) + 5;
    }

    update() {
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;

        //Edge detection
        if(this.x > canvas.width) {
            this.x = 0;
        }
        if(this.y > canvas.height) {
            this.y = 0;
        }
        if(this.x < 0) {
            this.x = canvas.width;
        }
        if(this.y < 0) {
            this.y = canvas.height;
        }

        //Get the distance between the mouse position and the particles
        let dx = mousePos.x - this.x;
        let dy = mousePos.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        //Calculate the force that should be used on the particle. Calculate a force multiplier for stronger force when the mouse is closer.
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        //Original distance was 400
        const maxDistance = 125;
        let forceMultiplier = (maxDistance - distance) / maxDistance;
        if (forceMultiplier < 0) forceMultiplier = 0;
        //Calculate the new directions. This takes a random innate density of the particle, the multiplier (based on the distance of the mouse) and the calculated force into consideration.
        let directionX = (forceDirectionX * forceMultiplier * this.density * 0.8);
        let directionY = (forceDirectionY * forceMultiplier * this.density * 0.8);
        //When mouse gets close apply the new directions
        if (distance < maxDistance + this.size) {
            this.x -= directionX;
            this.y -= directionY;
        }
    }

    draw() {
        context.beginPath();
        context.fillStyle = this.color;
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
    }
}

class TriangleParticle {
    constructor(x, y, size, growing = false, maxSize = canvas.height / 2, subEmitter = false, rotating = false, rotation = 0, filled = false, growSpeed = 9, fillColor = "black") {
        this.x = x;
        this.y = y;
        this.size = size;
        this.growing = growing;

        this.rotating = rotating;
        this.rotation = rotation;


        this.subParticleMaxCooldown = 110;
        this.subParticleCooldown = 0;
        this.opacity = 1;
        this.maxSize = maxSize;
        this.subEmitter = subEmitter;
        this.filled = filled;
        this.growSpeed = growSpeed;
        this.rotateSpeed = 1;
        this.fillColor = fillColor;
    }

    update() {
        if (this.growing && this.size < this.maxSize) {
            this.size += this.growSpeed;
        }



        else if (this.subParticleCooldown < 1 && this.subEmitter) {
            normalParticlesArray.push(new SubTriangleParticle(this.x, this.y, this.size, this.rotating, this.rotation))
            this.subParticleCooldown = this.subParticleMaxCooldown;
        }
        this.subParticleCooldown--;

        if(this.rotating) {
            this.rotation += this.rotateSpeed;
        }
    }

    draw() {
        context.save()
        context.strokeStyle = "white";
        context.strokeWidth = 5;
        context.fillStyle = this.fillColor;
        context.beginPath();
        //loaderContext.translate(this.x, this.y);

        //if (this.rotating) {
        //Verander het middelpunt van het document
        context.translate(this.x, this.y);
        //Draai het canvas met het middelpunt in het midden
        context.rotate(this.rotation * Math.PI / 180);
        //Verander het middelpunt terug zodat je geen lijnen tekent op een gedraaid canvas
        context.translate(-this.x, -this.y);
        //}

        //Triangle calculations
        //https://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag/36805543#36805543
        let x_center = this.x;
        let y_center = this.y;
        let angle;
        angle = Math.atan2(y_center-1-y_center,x_center-x_center)
        let pointA = {x : this.size*Math.cos(angle) + x_center ,y : this.size*Math.sin(angle) + y_center}
        angle += (1/3)*(2*Math.PI)
        let pointB = {x: this.size*Math.cos(angle) + x_center, y: this.size*Math.sin(angle) + y_center}
        angle += (1/3)*(2*Math.PI)
        let pointC = {x: this.size*Math.cos(angle) + x_center, y: this.size*Math.sin(angle) + y_center}

        context.beginPath();
        context.moveTo(pointA.x, pointA.y);
        context.lineTo(pointB.x, pointB.y);
        context.lineTo(pointC.x, pointB.y);
        context.lineTo(pointA.x, pointA.y);


        /*
        let h = this.size * (Math.sqrt(3) / 2);
        loaderContext.moveTo(0, -h / 2);
        loaderContext.lineTo(-this.size / 2, h / 2);
        loaderContext.lineTo(this.size / 2, h / 2);
        loaderContext.lineTo(0, -h / 2);

         */
        /*
        loaderContext.moveTo(this.x-this.size, this.y-this.size);
        loaderContext.lineTo(this.x+this.size, this.y-this.size);
        loaderContext.lineTo(this.x, this.y+(this.size));
         */
        if (this.filled) {
            context.fill();
        }
        context.stroke();
        context.restore();
    }
}

class SubTriangleParticle {
    constructor(x, y, size, rotating = false, rotation = 0, growSpeed = 9) {
        this.opacity = 1;
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = "white";
        this.rotating = rotating;
        this.rotation = rotation;
        this.fadeSpeed = 0.035//0.025;
        this.growSpeed = growSpeed;
        this.rotateSpeed = 1;

        this.points = [{}];
    }

    update() {
        this.opacity -= this.fadeSpeed;
        this.size += this.growSpeed;

        if(this.rotating) {
            this.rotation += this.rotateSpeed;
        }

        let angle;
        let x_center = this.x;
        let y_center = this.y;
        this.points = [];
        angle = Math.atan2(y_center-1-y_center,x_center-x_center)
        this.points[0] = {x : this.size*Math.cos(angle) + x_center ,y : this.size*Math.sin(angle) + y_center}
        angle += (1/3)*(2*Math.PI)
        this.points[1] = {x: this.size*Math.cos(angle) + x_center, y: this.size*Math.sin(angle) + y_center}
        angle += (1/3)*(2*Math.PI)
        this.points[2] = {x: this.size*Math.cos(angle) + x_center, y: this.size*Math.sin(angle) + y_center}
    }

    draw() {
        context.save()
        context.strokeStyle = this.color;
        context.strokeWidth = 2;
        context.translate(this.x, this.y);
        context.rotate(this.rotation * Math.PI / 180);
        context.translate(-this.x, -this.y);


        context.beginPath();
        this.points.forEach((point, i) => {
            context.lineTo(point.x, point.y);
        })
        context.lineTo(this.points[0].x, this.points[0].y);
        context.stroke();
        context.restore();
    }
}

class PolyPoint {
    constructor(x, y, rgb = {r: 255, b: 255, g: 255}, brightness = 0) {
        this.x = x;
        this.y = y;
        this.rgb = rgb;
        this.brightness = brightness;
    }
    update() {
        //this.x+=0.05;
        this.x+=0.02;
        if (this.x > canvas.width * 1.1) {
            this.x = canvas.width * -0.12;
        }
    }
}



export {ConstellationParticle, TriangleParticle, SubTriangleParticle, PolyPoint};