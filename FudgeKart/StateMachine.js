"use strict";
var FudgeKart;
(function (FudgeKart) {
    var ƒaid = FudgeAid;
    class ComponentStateMachineEnemy extends ƒaid.ComponentStateMachine {
        constructor() {
            super();
            this.instructions = ComponentStateMachineEnemy.instructions;
        }
        static setupStateMachine() {
            let setup = new ƒaid.StateMachineInstructions();
            setup.setAction(FudgeKart.JOB.PATROL, (_machine) => {
                let container = _machine.getContainer();
                // console.log(container);
                if (container.mtxLocal.translation.equals(container.posTarget, 0.1))
                    _machine.transit(FudgeKart.JOB.IDLE);
                container.move();
            });
            setup.setTransition(FudgeKart.JOB.PATROL, FudgeKart.JOB.IDLE, (_machine) => {
                let container = _machine.getContainer();
                ƒ.Time.game.setTimer(3000, 1, (_event) => {
                    container.chooseTargetPosition();
                    _machine.transit(FudgeKart.JOB.PATROL);
                });
            });
            return setup;
        }
    }
    ComponentStateMachineEnemy.instructions = ComponentStateMachineEnemy.setupStateMachine();
    FudgeKart.ComponentStateMachineEnemy = ComponentStateMachineEnemy;
})(FudgeKart || (FudgeKart = {}));
//# sourceMappingURL=StateMachine.js.map