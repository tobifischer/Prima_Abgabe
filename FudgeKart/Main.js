"use strict";
var FudgeKart;
(function (FudgeKart) {
    var ƒ = FudgeCore;
    var ƒaid = FudgeAid;
    window.addEventListener("load", hndLoad);
    const clrWhite = ƒ.Color.CSS("white");
    FudgeKart.sizeWall = 3;
    FudgeKart.numWalls = 20;
    FudgeKart.avatar = new ƒ.Node("Avatar");
    let root = new ƒ.Node("Root");
    let walls;
    let enemies;
    let ctrSpeed = new ƒ.Control("AvatarSpeed", 0.3, 0 /* PROPORTIONAL */);
    ctrSpeed.setDelay(100);
    let ctrStrafe = new ƒ.Control("AvatarSpeed", 0.1, 0 /* PROPORTIONAL */);
    ctrSpeed.setDelay(100);
    let ctrRotation = new ƒ.Control("AvatarRotation", -0.1, 0 /* PROPORTIONAL */);
    ctrRotation.setDelay(100);
    async function hndLoad(_event) {
        const canvas = document.querySelector("canvas");
        let meshQuad = new ƒ.MeshQuad("Quad");
        let txtFloor = new ƒ.TextureImage("../Assets/DEM1_5.png");
        let mtrFloor = new ƒ.Material("Floor", ƒ.ShaderTexture, new ƒ.CoatTextured(clrWhite, txtFloor));
        let floor = new ƒaid.Node("Floor", ƒ.Matrix4x4.ROTATION_X(-90), mtrFloor, meshQuad);
        floor.mtxLocal.scale(ƒ.Vector3.ONE(FudgeKart.sizeWall * FudgeKart.numWalls));
        floor.getComponent(ƒ.ComponentMaterial).pivot.scale(ƒ.Vector2.ONE(FudgeKart.numWalls));
        root.appendChild(floor);
        walls = createWalls();
        root.appendChild(walls);
        enemies = await createEnemies();
        root.appendChild(enemies);
        let cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.projectCentral(1, 45, ƒ.FIELD_OF_VIEW.DIAGONAL, 0.2, 10000);
        cmpCamera.pivot.translate(ƒ.Vector3.Y(1.7)); // 1.7
        //cmpCamera.pivot.rotateZ(ƒ.Vector3.Z(45));
        cmpCamera.backgroundColor = ƒ.Color.CSS("darkblue");
        FudgeKart.avatar.addComponent(cmpCamera);
        FudgeKart.avatar.addComponent(new ƒ.ComponentTransform());
        FudgeKart.avatar.mtxLocal.translate(ƒ.Vector3.Z(10));
        FudgeKart.avatar.mtxLocal.rotate(ƒ.Vector3.Y(180));
        root.appendChild(FudgeKart.avatar);
        FudgeKart.viewport = new ƒ.Viewport();
        FudgeKart.viewport.initialize("Viewport", root, cmpCamera, canvas);
        FudgeKart.viewport.draw();
        canvas.addEventListener("mousemove", hndMouse);
        canvas.addEventListener("click", canvas.requestPointerLock);
        canvas.addEventListener("click", shoot);
        FudgeKart.Hud.start();
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, hndLoop);
        ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 120);
    }
    function shoot() {
        FudgeKart.gameState.ammo--;
    }
    function hndLoop(_event) {
        ctrSpeed.setInput(ƒ.Keyboard.mapToValue(-1, 0, [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN])
            + ƒ.Keyboard.mapToValue(1, 0, [ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP]));
        ctrStrafe.setInput(ƒ.Keyboard.mapToValue(1, 0, [ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT])
            + ƒ.Keyboard.mapToValue(-1, 0, [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]));
        moveAvatar(ctrSpeed.getOutput(), ctrRotation.getOutput(), ctrStrafe.getOutput());
        ctrRotation.setInput(0);
        for (let enemy of enemies.getChildren())
            enemy.update();
        FudgeKart.viewport.draw();
    }
    function hndMouse(_event) {
        // console.log(_event.movementX, _event.movementY);
        ctrRotation.setInput(_event.movementX);
    }
    function moveAvatar(_speed, _rotation, _strafe) {
        FudgeKart.avatar.mtxLocal.rotateY(_rotation);
        let posOld = FudgeKart.avatar.mtxLocal.translation;
        FudgeKart.avatar.mtxLocal.translateZ(_speed);
        FudgeKart.avatar.mtxLocal.translateX(_strafe);
        let bouncedOff = bounceOffWalls(walls.getChildren());
        if (bouncedOff.length < 2)
            return;
        bouncedOff = bounceOffWalls(bouncedOff);
        if (bouncedOff.length == 0)
            return;
        console.log("Stuck!");
        FudgeKart.avatar.mtxLocal.translation = posOld;
    }
    function bounceOffWalls(_walls) {
        let bouncedOff = [];
        let posAvatar = FudgeKart.avatar.mtxLocal.translation;
        for (let wall of _walls) {
            let posBounce = wall.calculateBounce(posAvatar, 1);
            if (posBounce) {
                FudgeKart.avatar.mtxLocal.translation = posBounce;
                bouncedOff.push(wall);
            }
        }
        return bouncedOff;
    }
    async function createEnemies() {
        let enemies = new ƒ.Node("Enemies");
        let txtCacodemon = new ƒ.TextureImage();
        await txtCacodemon.load("../Assets/Cacodemon.png");
        let coatSprite = new ƒ.CoatTextured(clrWhite, txtCacodemon);
        FudgeKart.Enemy.generateSprites(coatSprite);
        for (let i = 0; i < 1; i++)
            enemies.appendChild(new FudgeKart.Enemy("Cacodemon" + i, ƒ.Vector3.Z(3)));
        // enemies.appendChild(new Enemy("Cacodemon1", ƒ.Vector3.X(3)));
        // enemies.appendChild(new Enemy("Cacodemon2", ƒ.Vector3.X(-3)));
        console.log("Enemies", enemies);
        return enemies;
    }
    function createWalls() {
        let walls = new ƒ.Node("Walls");
        let txtWall = new ƒ.TextureImage("../Assets/CEMPOIS.png");
        let mtrWall = new ƒ.Material("Wall", ƒ.ShaderTexture, new ƒ.CoatTextured(clrWhite, txtWall));
        walls.appendChild(new FudgeKart.Wall(ƒ.Vector2.ONE(3), ƒ.Vector3.Y(FudgeKart.sizeWall / 2), ƒ.Vector3.ZERO(), mtrWall));
        walls.appendChild(new FudgeKart.Wall(ƒ.Vector2.ONE(3), ƒ.Vector3.SCALE(new ƒ.Vector3(0.5, 1, -0.866), FudgeKart.sizeWall / 2), ƒ.Vector3.Y(120), mtrWall));
        walls.appendChild(new FudgeKart.Wall(ƒ.Vector2.ONE(3), ƒ.Vector3.SCALE(new ƒ.Vector3(-0.5, 1, -0.866), FudgeKart.sizeWall / 2), ƒ.Vector3.Y(-120), mtrWall));
        for (let i = -FudgeKart.numWalls / 2 + 0.5; i < FudgeKart.numWalls / 2; i++) {
            walls.appendChild(new FudgeKart.Wall(ƒ.Vector2.ONE(3), ƒ.Vector3.SCALE(new ƒ.Vector3(-FudgeKart.numWalls / 2, 0.5, i), FudgeKart.sizeWall), ƒ.Vector3.Y(90), mtrWall));
            // for (let i: number = -numWalls / 2 + 0.5; i < numWalls / 2; i++)
            walls.appendChild(new FudgeKart.Wall(ƒ.Vector2.ONE(3), ƒ.Vector3.SCALE(new ƒ.Vector3(FudgeKart.numWalls / 2, 0.5, i), FudgeKart.sizeWall), ƒ.Vector3.Y(-90), mtrWall));
            // for (let i: number = -numWalls / 2 + 0.5; i < numWalls / 2; i++)
            walls.appendChild(new FudgeKart.Wall(ƒ.Vector2.ONE(3), ƒ.Vector3.SCALE(new ƒ.Vector3(i, 0.5, -FudgeKart.numWalls / 2), FudgeKart.sizeWall), ƒ.Vector3.Y(0), mtrWall));
            // for (let i: number = -numWalls / 2 + 0.5; i < numWalls / 2; i++)
            walls.appendChild(new FudgeKart.Wall(ƒ.Vector2.ONE(3), ƒ.Vector3.SCALE(new ƒ.Vector3(i, 0.5, FudgeKart.numWalls / 2), FudgeKart.sizeWall), ƒ.Vector3.Y(180), mtrWall));
        }
        return walls;
    }
})(FudgeKart || (FudgeKart = {}));
//# sourceMappingURL=Main.js.map