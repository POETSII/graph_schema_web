/// <reference path="../core/core.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "../core/core", "../core/core"], function (require, exports, POETS, core_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TypedData = POETS.TypedData;
    var EdgeType = POETS.EdgeType;
    var GenericTypedDataSpec = POETS.GenericTypedDataSpec;
    var UpdateMessage = /** @class */ (function (_super) {
        __extends(UpdateMessage, _super);
        function UpdateMessage(_spec_, t, v) {
            if (t === void 0) { t = 0; }
            if (v === void 0) { v = 0; }
            var _this = _super.call(this, "update_message", _spec_) || this;
            _this.t = t;
            _this.v = v;
            return _this;
        }
        ;
        UpdateMessage.elements = [
            core_1.tInt("t"),
            core_1.tFloat("v")
        ];
        return UpdateMessage;
    }(TypedData));
    exports.UpdateMessage = UpdateMessage;
    ;
    var UpdateEdgeProperties = /** @class */ (function (_super) {
        __extends(UpdateEdgeProperties, _super);
        function UpdateEdgeProperties(_spec_, w) {
            if (w === void 0) { w = 0; }
            var _this = _super.call(this, "update_properties", _spec_) || this;
            _this.w = w;
            return _this;
        }
        ;
        UpdateEdgeProperties.elements = [
            core_1.tFloat("w")
        ];
        return UpdateEdgeProperties;
    }(TypedData));
    exports.UpdateEdgeProperties = UpdateEdgeProperties;
    exports.initEdgeType = new EdgeType("__init__");
    exports.updateEdgeType = new EdgeType("update", new GenericTypedDataSpec(UpdateMessage, UpdateMessage.elements), new GenericTypedDataSpec(UpdateEdgeProperties, UpdateEdgeProperties.elements));
    var HeatGraphProperties = /** @class */ (function (_super) {
        __extends(HeatGraphProperties, _super);
        function HeatGraphProperties(_spec_, maxTime) {
            if (maxTime === void 0) { maxTime = 1000000; }
            var _this = _super.call(this, "heat_properties", _spec_) || this;
            _this.maxTime = maxTime;
            return _this;
        }
        ;
        HeatGraphProperties.elements = [
            core_1.tInt("maxTime")
        ];
        return HeatGraphProperties;
    }(TypedData));
    exports.HeatGraphProperties = HeatGraphProperties;
    ;
});
//# sourceMappingURL=heat_types.js.map