define(["require", "exports", "./typed_data"], function (require, exports, typed_data_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function assert(cond) {
        if (!cond) {
            console.assert(false);
        }
    }
    exports.assert = assert;
    // http://stackoverflow.com/a/3826081
    function get_type(thing) {
        if (thing === null)
            return "[object Null]"; // special case
        return Object.prototype.toString.call(thing);
    }
    exports.get_type = get_type;
    var EdgeType = /** @class */ (function () {
        function EdgeType(id, message, properties, state) {
            if (message === void 0) { message = new typed_data_1.EmptyTypedDataSpec(); }
            if (properties === void 0) { properties = new typed_data_1.EmptyTypedDataSpec(); }
            if (state === void 0) { state = new typed_data_1.EmptyTypedDataSpec(); }
            this.id = id;
            this.message = message;
            this.properties = properties;
            this.state = state;
        }
        ;
        return EdgeType;
    }());
    exports.EdgeType = EdgeType;
    ;
    var InputPort = /** @class */ (function () {
        function InputPort(name, edgeType) {
            this.name = name;
            this.edgeType = edgeType;
            this.index = -1;
        }
        InputPort.prototype.setIndex = function (_index) {
            assert(this.index == -1);
            this.index = _index;
        };
        return InputPort;
    }());
    exports.InputPort = InputPort;
    ;
    var OutputPort = /** @class */ (function () {
        function OutputPort(name, edgeType) {
            this.name = name;
            this.edgeType = edgeType;
            this.index = -1;
            this.rts_flag = 0;
        }
        OutputPort.prototype.setIndex = function (_index) {
            assert(this.index == -1);
            this.index = _index;
            this.rts_flag = 1 << _index;
        };
        return OutputPort;
    }());
    exports.OutputPort = OutputPort;
    ;
    var DeviceType = /** @class */ (function () {
        function DeviceType(id, properties, state, inputs, outputs, outputCount) {
            if (inputs === void 0) { inputs = []; }
            if (outputs === void 0) { outputs = []; }
            if (outputCount === void 0) { outputCount = outputs.length; }
            this.id = id;
            this.properties = properties;
            this.state = state;
            this.outputCount = outputCount;
            this.inputs = {};
            this.inputsByIndex = [];
            this.outputs = {};
            this.outputsByIndex = [];
            var numInputs = 0;
            for (var _i = 0, inputs_1 = inputs; _i < inputs_1.length; _i++) {
                var i = inputs_1[_i];
                //console.log(`  adding ${i.name}, edgeType=${i.edgeType.id}`);
                i.setIndex(numInputs);
                this.inputs[i.name] = i;
                this.inputsByIndex.push(i);
                numInputs++;
            }
            var numOutputs = 0;
            for (var _a = 0, outputs_1 = outputs; _a < outputs_1.length; _a++) {
                var o = outputs_1[_a];
                //console.log(`  adding ${o.name}`);
                o.setIndex(numOutputs);
                this.outputs[o.name] = o;
                this.outputsByIndex.push(o);
                numOutputs++;
            }
            for (var _b = 0, inputs_2 = inputs; _b < inputs_2.length; _b++) {
                var i = inputs_2[_b];
                i.onBindDevice(this);
            }
            for (var _c = 0, outputs_2 = outputs; _c < outputs_2.length; _c++) {
                var o = outputs_2[_c];
                o.onBindDevice(this);
            }
        }
        DeviceType.prototype.getInput = function (name) {
            if (!this.inputs.hasOwnProperty(name))
                throw new Error("No input called " + name);
            return this.inputs[name];
        };
        DeviceType.prototype.getInputByIndex = function (index) {
            return this.inputsByIndex[index];
        };
        DeviceType.prototype.getOutput = function (name) {
            if (!this.outputs.hasOwnProperty(name))
                throw new Error("No output called " + name);
            return this.outputs[name];
        };
        DeviceType.prototype.getOutputByIndex = function (index) {
            return this.outputsByIndex[index];
        };
        return DeviceType;
    }());
    exports.DeviceType = DeviceType;
    ;
    var GraphType = /** @class */ (function () {
        function GraphType(id, properties, _deviceTypes) {
            this.id = id;
            this.properties = properties;
            this.deviceTypes = {};
            this.edgeTypes = {};
            for (var _i = 0, _deviceTypes_1 = _deviceTypes; _i < _deviceTypes_1.length; _i++) {
                var d = _deviceTypes_1[_i];
                this.deviceTypes[d.id] = d;
                for (var eId in d.inputs) {
                    if (!(eId in this.edgeTypes)) {
                        this.edgeTypes[eId] = d.inputs[eId].edgeType;
                    }
                }
                for (var eId in d.outputs) {
                    if (!(eId in this.edgeTypes)) {
                        this.edgeTypes[eId] = d.outputs[eId].edgeType;
                    }
                }
            }
        }
        return GraphType;
    }());
    exports.GraphType = GraphType;
    ;
});
//# sourceMappingURL=types.js.map