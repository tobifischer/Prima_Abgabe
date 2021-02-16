"use strict";
var FudgeKart;
(function (FudgeKart) {
    var ƒui = FudgeUserInterface;
    class GameState extends ƒ.Mutable {
        constructor() {
            super(...arguments);
            this.health = 100;
            this.score = 0;
            this.ammo = 100;
        }
        reduceMutator(_mutator) { }
    }
    FudgeKart.GameState = GameState;
    FudgeKart.gameState = new GameState();
    class Hud {
        static start() {
            let domHud = document.querySelector("div#hud");
            Hud.controller = new ƒui.Controller(FudgeKart.gameState, domHud);
            Hud.controller.updateUserInterface();
        }
    }
    FudgeKart.Hud = Hud;
})(FudgeKart || (FudgeKart = {}));
//# sourceMappingURL=Hud.js.map