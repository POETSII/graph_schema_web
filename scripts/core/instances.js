define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DeviceInstance = /** @class */ (function () {
        function DeviceInstance(id, deviceType, properties, state, metadata) {
            if (properties === void 0) { properties = deviceType.properties.create(); }
            if (state === void 0) { state = deviceType.state.create(); }
            if (metadata === void 0) { metadata = {}; }
            this.id = id;
            this.deviceType = deviceType;
            this.properties = properties;
            this.state = state;
            this.metadata = metadata;
            this.rts = 0;
            this.inputs = {};
            this.outputs = {};
            // These are faster to access than by name
            this.outputsByIndex = [];
            this.inputsByIndex = [];
            // Controls the rate for this device. If rate==1.0, then
            // it runs at full rate, if rate==0.0, then nothing happens.
            // The exact semantics are determined by the simulator
            this.rate = Math.random() * 0.1 + 0.9;
            this._is_blocked = false;
            this._is_rts = false;
            for (var i = 0; i < deviceType.outputsByIndex.length; i++) {
                var k = deviceType.outputsByIndex[i];
                this.outputs[k.name] = [];
                this.outputsByIndex.push([]);
            }
            for (var i = 0; i < deviceType.inputsByIndex.length; i++) {
                var k = deviceType.inputsByIndex[i];
                this.inputs[k.name] = [];
                this.inputsByIndex.push([]);
            }
        }
        DeviceInstance.prototype.update = function () {
            var _all_blocked = true; // All ports that are ready are also blocked
            // Loop over all bits in rts
            var bits = this.rts;
            var index = 0;
            while (bits) {
                var _this_blocked = false;
                var is_ready = bits & 1;
                if (is_ready) {
                    var outgoing = this.outputsByIndex[index];
                    for (var _i = 0, outgoing_1 = outgoing; _i < outgoing_1.length; _i++) {
                        var e = outgoing_1[_i];
                        if (e.full()) {
                            _this_blocked = true;
                            break;
                        }
                    }
                    if (!_this_blocked) {
                        _all_blocked = false;
                        break; // We don't need to keep checking
                    }
                }
                bits = bits >> 1;
                index = index + 1;
            }
            this._is_rts = this.rts != 0;
            this._is_blocked = _all_blocked;
        };
        DeviceInstance.prototype.update_rts_only = function () {
            this._is_rts = this.rts != 0;
        };
        DeviceInstance.prototype.blocked = function () {
            return this._is_blocked && this._is_rts;
        };
        DeviceInstance.prototype.is_rts = function () {
            return this._is_rts;
        };
        return DeviceInstance;
    }());
    exports.DeviceInstance = DeviceInstance;
    ;
    var EdgeInstance = /** @class */ (function () {
        function EdgeInstance(id, edgeType, srcDev, srcPort, dstDev, dstPort, properties, state, metadata, queue) {
            if (properties === void 0) { properties = edgeType.properties.create(); }
            if (state === void 0) { state = edgeType.state.create(); }
            if (metadata === void 0) { metadata = {}; }
            if (queue === void 0) { queue = []; }
            this.id = id;
            this.edgeType = edgeType;
            this.srcDev = srcDev;
            this.srcPort = srcPort;
            this.dstDev = dstDev;
            this.dstPort = dstPort;
            this.properties = properties;
            this.state = state;
            this.metadata = metadata;
            this.queue = queue;
            this._is_blocked = false;
        }
        ;
        EdgeInstance.prototype.full = function () {
            return this.queue.length > 0;
        };
        EdgeInstance.prototype.empty = function () {
            return this.queue.length == 0;
        };
        EdgeInstance.prototype.update = function () {
        };
        return EdgeInstance;
    }());
    exports.EdgeInstance = EdgeInstance;
    ;
    var GraphInstance = /** @class */ (function () {
        function GraphInstance(graphType, id, propertiesG) {
            this.graphType = graphType;
            this.id = id;
            this.propertiesG = propertiesG;
            this.devices = {};
            this.edges = {};
            this.devicesA = [];
            this.edgesA = [];
            this.properties = graphType.properties.import(propertiesG);
        }
        GraphInstance.prototype.getDevice = function (id) {
            if (!this.devices.hasOwnProperty(id))
                throw new Error("No device called " + id);
            return this.devices[id];
        };
        GraphInstance.prototype.enumDevices = function () {
            return this.devicesA;
        };
        GraphInstance.prototype.enumEdges = function () {
            return this.edgesA;
        };
        GraphInstance.prototype.addDevice = function (id, deviceType, propertiesG, metadata) {
            if (propertiesG === void 0) { propertiesG = null; }
            var properties = deviceType.properties.import(propertiesG);
            if (this.devices.hasOwnProperty(id))
                throw new Error("Device already exists.");
            var dev = new DeviceInstance(id, deviceType, properties, deviceType.state.create(), metadata);
            this.devices[id] = dev;
            this.devicesA.push(dev);
            return dev;
        };
        GraphInstance.prototype.addEdge = function (dstId, dstPortName, srcId, srcPortName, propertiesG, metadata) {
            if (propertiesG === void 0) { propertiesG = null; }
            if (metadata === void 0) { metadata = {}; }
            var dstDev = this.getDevice(dstId);
            var dstPort = dstDev.deviceType.getInput(dstPortName);
            var srcDev = this.getDevice(srcId);
            var srcPort = srcDev.deviceType.getOutput(srcPortName);
            if (dstPort.edgeType.id != srcPort.edgeType.id)
                throw new Error("Edge types don't match : " + dstId + ":" + dstPortName + " has " + dstPort.edgeType.id + " vs " + srcId + ":" + srcPortName + " has " + srcPort.edgeType.id);
            var edgeType = dstPort.edgeType;
            var properties = edgeType.properties.import(propertiesG);
            this.addEdgeRaw(dstDev, dstPort, srcDev, srcPort, properties, metadata);
        };
        GraphInstance.prototype.addEdgeRaw = function (dstDev, dstPort, srcDev, srcPort, properties, metadata) {
            if (metadata === void 0) { metadata = {}; }
            var id = dstDev.id + ":" + dstPort.name + "-" + srcDev.id + ":" + srcPort.name;
            if (this.edges.hasOwnProperty(id))
                throw new Error("Edge already exists.");
            var edge = new EdgeInstance(id, dstPort.edgeType, srcDev, srcPort, dstDev, dstPort, properties, dstPort.edgeType.state.create(), metadata);
            this.edges[id] = edge;
            this.edgesA.push(edge);
            srcDev.outputs[srcPort.name].push(edge);
            srcDev.outputsByIndex[srcPort.index].push(edge);
            dstDev.inputs[dstPort.name].push(edge);
            dstDev.inputsByIndex[dstPort.index].push(edge);
        };
        return GraphInstance;
    }());
    exports.GraphInstance = GraphInstance;
    ;
});
//# sourceMappingURL=instances.js.map