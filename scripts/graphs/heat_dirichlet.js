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
define(["require", "exports", "../core/core", "./heat_types", "../core/typed_data"], function (require, exports, POETS, heat_types_1, typed_data_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var assert = POETS.assert;
    var TypedData = POETS.TypedData;
    var DeviceType = POETS.DeviceType;
    var GenericTypedDataSpec = POETS.GenericTypedDataSpec;
    var InputPort = POETS.InputPort;
    var OutputPort = POETS.OutputPort;
    var DirichletDeviceProperties = /** @class */ (function (_super) {
        __extends(DirichletDeviceProperties, _super);
        function DirichletDeviceProperties(_spec_, dt, neighbours, amplitude, phase, frequency, bias) {
            if (dt === void 0) { dt = 1; }
            if (neighbours === void 0) { neighbours = 0; }
            if (amplitude === void 0) { amplitude = 1; }
            if (phase === void 0) { phase = 0.5; }
            if (frequency === void 0) { frequency = 1; }
            if (bias === void 0) { bias = 0; }
            var _this = _super.call(this, "dirichlet_properties", _spec_) || this;
            _this.dt = dt;
            _this.neighbours = neighbours;
            _this.amplitude = amplitude;
            _this.phase = phase;
            _this.frequency = frequency;
            _this.bias = bias;
            return _this;
        }
        DirichletDeviceProperties.elements = [
            typed_data_1.tInt("dt", 1), typed_data_1.tInt("neighbours"),
            typed_data_1.tFloat("amplitude", 1.0),
            typed_data_1.tFloat("phase", 0.5),
            typed_data_1.tFloat("frequency", 1.0),
            typed_data_1.tFloat("bias")
        ];
        return DirichletDeviceProperties;
    }(TypedData));
    ;
    var DirichletDeviceState = /** @class */ (function (_super) {
        __extends(DirichletDeviceState, _super);
        function DirichletDeviceState(_spec_, v, t, cs, ns) {
            if (v === void 0) { v = 0; }
            if (t === void 0) { t = 0; }
            if (cs === void 0) { cs = 0; }
            if (ns === void 0) { ns = 0; }
            var _this = _super.call(this, "dirichlet_state", _spec_) || this;
            _this.v = v;
            _this.t = t;
            _this.cs = cs;
            _this.ns = ns;
            return _this;
        }
        ;
        DirichletDeviceState.elements = [
            typed_data_1.tFloat("v"), typed_data_1.tInt("t"),
            typed_data_1.tFloat("cs"), typed_data_1.tInt("ns")
        ];
        return DirichletDeviceState;
    }(TypedData));
    ;
    var DirichletInitInputPort = /** @class */ (function (_super) {
        __extends(DirichletInitInputPort, _super);
        function DirichletInitInputPort() {
            var _this = _super.call(this, "__init__", heat_types_1.initEdgeType) || this;
            _this.rts_flag_out = 0;
            return _this;
        }
        DirichletInitInputPort.prototype.onBindDevice = function (parent) {
            this.rts_flag_out = parent.getOutput("out").rts_flag;
        };
        DirichletInitInputPort.prototype.onReceive = function (graphPropertiesG, devicePropertiesG, deviceStateG, edgePropertiesG, edgeStateG, messageG) {
            var deviceProperties = devicePropertiesG;
            var deviceState = deviceStateG;
            deviceState.t = 0;
            deviceState.cs = deviceProperties.neighbours; // Force us into the sending ready state
            deviceState.ns = 0;
            deviceState.v = deviceProperties.bias + deviceProperties.amplitude
                * Math.sin(deviceProperties.phase + deviceProperties.frequency * deviceState.t);
            return deviceState.cs == deviceProperties.neighbours ? this.rts_flag_out : 0;
        };
        return DirichletInitInputPort;
    }(InputPort));
    ;
    var DirichletInInputPort = /** @class */ (function (_super) {
        __extends(DirichletInInputPort, _super);
        function DirichletInInputPort() {
            var _this = _super.call(this, "in", heat_types_1.updateEdgeType) || this;
            _this.rts_flag_out = 0;
            return _this;
        }
        DirichletInInputPort.prototype.onBindDevice = function (parent) {
            this.rts_flag_out = parent.getOutput("out").rts_flag;
        };
        DirichletInInputPort.prototype.onReceive = function (graphPropertiesG, devicePropertiesG, deviceStateG, edgePropertiesG, edgeStateG, messageG) {
            var deviceProperties = devicePropertiesG;
            var deviceState = deviceStateG;
            var message = messageG;
            if (message.t == deviceState.t) {
                deviceState.cs++;
            }
            else {
                assert(message.t == deviceState.t + deviceProperties.dt);
                deviceState.ns++;
            }
            return deviceState.cs == deviceProperties.neighbours ? this.rts_flag_out : 0;
        };
        return DirichletInInputPort;
    }(InputPort));
    ;
    var DirichletOutOutputPort = /** @class */ (function (_super) {
        __extends(DirichletOutOutputPort, _super);
        function DirichletOutOutputPort() {
            var _this = _super.call(this, "out", heat_types_1.updateEdgeType) || this;
            _this.rts_flag_out = 0;
            return _this;
        }
        DirichletOutOutputPort.prototype.onBindDevice = function (parent) {
            this.rts_flag_out = parent.getOutput("out").rts_flag;
        };
        DirichletOutOutputPort.prototype.onSend = function (graphPropertiesG, devicePropertiesG, deviceStateG, messageG) {
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
                deviceState.v = deviceProperties.bias + deviceProperties.amplitude
                    * Math.sin(deviceProperties.phase + deviceProperties.frequency * deviceState.t);
                deviceState.t += deviceProperties.dt;
                deviceState.cs = deviceState.ns;
                deviceState.ns = 0;
                message.t = deviceState.t;
                message.v = deviceState.v;
                rts = deviceState.cs == deviceProperties.neighbours ? this.rts_flag_out : 0;
                doSend = true;
            }
            return [doSend, rts];
        };
        return DirichletOutOutputPort;
    }(OutputPort));
    ;
    exports.dirichletDeviceType = new DeviceType("dirichlet_variable", new GenericTypedDataSpec(DirichletDeviceProperties, DirichletDeviceProperties.elements), new GenericTypedDataSpec(DirichletDeviceState, DirichletDeviceState.elements), [
        new DirichletInitInputPort(),
        new DirichletInInputPort()
    ], [
        new DirichletOutOutputPort()
    ]);
});
//# sourceMappingURL=heat_dirichlet.js.map