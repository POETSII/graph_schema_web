define(["require", "exports", "../core/core", "./heat"], function (require, exports, core_1, heat_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function registerAllGraphTypes() {
        core_1.registerGraphType(heat_1.heatGraphType);
    }
    exports.registerAllGraphTypes = registerAllGraphTypes;
});
//# sourceMappingURL=all.js.map