/// <reference path="heat_types.ts" />
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
define(["require", "exports", "../core/core", "../core/typed_data", "./heat_types"], function (require, exports, POETS, typed_data_1, heat_types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var assert = POETS.assert;
    var TypedData = POETS.TypedData;
    var DeviceType = POETS.DeviceType;
    var GenericTypedDataSpec = POETS.GenericTypedDataSpec;
    var InputPort = POETS.InputPort;
    var OutputPort = POETS.OutputPort;
    var CellDeviceProperties = /** @class */ (function (_super) {
        __extends(CellDeviceProperties, _super);
        function CellDeviceProperties(_spec_, nhood, dt, iv, wSelf) {
            if (nhood === void 0) { nhood = 0; }
            if (dt === void 0) { dt = 1; }
            if (iv === void 0) { iv = 0; }
            if (wSelf === void 0) { wSelf = 0; }
            var _this = _super.call(this, "cell_properties", _spec_) || this;
            _this.nhood = nhood;
            _this.dt = dt;
            _this.iv = iv;
            _this.wSelf = wSelf;
            return _this;
        }
        ;
        CellDeviceProperties.elements = [
            typed_data_1.tInt("nhood"), typed_data_1.tInt("dt", 1), typed_data_1.tFloat("iv"), typed_data_1.tFloat("wSelf")
        ];
        return CellDeviceProperties;
    }(TypedData));
    ;
    var CellDeviceState = /** @class */ (function (_super) {
        __extends(CellDeviceState, _super);
        function CellDeviceState(_spec_, v, t, cs, ca, ns, na, force) {
            if (v === void 0) { v = 0; }
            if (t === void 0) { t = 0; }
            if (cs === void 0) { cs = 0; }
            if (ca === void 0) { ca = 0; }
            if (ns === void 0) { ns = 0; }
            if (na === void 0) { na = 0; }
            if (force === void 0) { force = false; }
            var _this = _super.call(this, "cell_state", _spec_) || this;
            _this.v = v;
            _this.t = t;
            _this.cs = cs;
            _this.ca = ca;
            _this.ns = ns;
            _this.na = na;
            _this.force = force;
            return _this;
        }
        ;
        CellDeviceState.elements = [
            typed_data_1.tFloat("v"), typed_data_1.tInt("t"),
            typed_data_1.tInt("cs"), typed_data_1.tFloat("ca"),
            typed_data_1.tInt("ns"), typed_data_1.tFloat("na"),
            typed_data_1.tBoolean("force")
        ];
        return CellDeviceState;
    }(TypedData));
    ;
    var CellInitInputPort = /** @class */ (function (_super) {
        __extends(CellInitInputPort, _super);
        function CellInitInputPort() {
            return _super.call(this, "__init__", heat_types_1.initEdgeType) || this;
        }
        CellInitInputPort.prototype.onBindDevice = function (parent) {
            this.rts_flag_out = parent.getOutput("out").rts_flag;
        };
        CellInitInputPort.prototype.onReceive = function (graphPropertiesG, devicePropertiesG, deviceStateG, edgePropertiesG, edgeStateG, messageG) {
            var deviceProperties = devicePropertiesG;
            var deviceState = deviceStateG;
            deviceState.v = deviceProperties.iv;
            deviceState.t = 0;
            deviceState.cs = deviceProperties.nhood; // Force us into the sending ready state
            deviceState.ca = deviceProperties.iv; // This is the first value
            deviceState.ns = 0;
            deviceState.na = 0;
            return deviceState.cs == deviceProperties.nhood ? this.rts_flag_out : 0;
        };
        return CellInitInputPort;
    }(InputPort));
    ;
    var CellInInputPort = /** @class */ (function (_super) {
        __extends(CellInInputPort, _super);
        function CellInInputPort() {
            return _super.call(this, "in", heat_types_1.updateEdgeType) || this;
        }
        CellInInputPort.prototype.onBindDevice = function (parent) {
            this.rts_flag_out = parent.getOutput("out").rts_flag;
        };
        CellInInputPort.prototype.onReceive = function (graphPropertiesG, devicePropertiesG, deviceStateG, edgePropertiesG, edgeStateG, messageG) {
            var deviceProperties = devicePropertiesG;
            var deviceState = deviceStateG;
            var edgeProperties = edgePropertiesG;
            var message = messageG;
            //console.log("  w = "+edgeProperties.w);
            if (message.t == deviceState.t) {
                deviceState.cs++;
                deviceState.ca += edgeProperties.w * message.v;
            }
            else {
                assert(message.t == deviceState.t + 1);
                deviceState.ns++;
                deviceState.na += edgeProperties.w * message.v;
            }
            return deviceState.cs == deviceProperties.nhood ? this.rts_flag_out : 0;
        };
        return CellInInputPort;
    }(InputPort));
    ;
    var CellOutOutputPort = /** @class */ (function (_super) {
        __extends(CellOutOutputPort, _super);
        function CellOutOutputPort() {
            return _super.call(this, "out", heat_types_1.updateEdgeType) || this;
        }
        CellOutOutputPort.prototype.onBindDevice = function (parent) {
            this.rts_flags_out = parent.getOutput("out").rts_flag;
        };
        CellOutOutputPort.prototype.onSend = function (graphPropertiesG, devicePropertiesG, deviceStateG, messageG) {
            var graphProperties = graphPropertiesG;
            var deviceProperties = devicePropertiesG;
            var deviceState = deviceStateG;
            var message = messageG;
            var doSend = false;
            var rts = 0;
            if (deviceState.t > graphProperties.maxTime) {
                // do nothing
            }
            else {
                if (!deviceState.force) {
                    deviceState.v = deviceState.ca;
                }
                deviceState.t += deviceProperties.dt;
                deviceState.cs = deviceState.ns;
                deviceState.ca = deviceState.na + deviceProperties.wSelf * deviceState.v;
                deviceState.ns = 0;
                deviceState.na = 0;
                message.t = deviceState.t;
                message.v = deviceState.v;
                rts = deviceState.cs == deviceProperties.nhood ? this.rts_flags_out : 0;
                doSend = true;
            }
            return [doSend, rts];
        };
        return CellOutOutputPort;
    }(OutputPort));
    ;
    exports.cellDeviceType = new DeviceType("cell", new GenericTypedDataSpec(CellDeviceProperties, CellDeviceProperties.elements), new GenericTypedDataSpec(CellDeviceState, CellDeviceState.elements), [
        new CellInitInputPort(),
        new CellInInputPort()
    ], [
        new CellOutOutputPort()
    ]);
});
//# sourceMappingURL=heat_cell.js.map