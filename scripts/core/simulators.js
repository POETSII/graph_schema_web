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
define(["require", "exports", "./types"], function (require, exports, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function clone(s) {
        var res = {};
        for (var k in s) {
            res[k] = s[k];
        }
        return res;
    }
    var EventType;
    (function (EventType) {
        EventType[EventType["Send"] = 0] = "Send";
        EventType[EventType["Receive"] = 1] = "Receive";
        EventType[EventType["Init"] = 2] = "Init";
        EventType[EventType["Skip"] = 3] = "Skip";
    })(EventType || (EventType = {}));
    var Event = /** @class */ (function () {
        function Event() {
            this.applied = true;
        }
        Event.prototype.apply = function () {
            types_1.assert(!this.applied);
            this.swap();
            this.applied = true;
        };
        Event.prototype.unapply = function () {
            types_1.assert(this.applied);
            this.swap();
            this.applied = false;
        };
        return Event;
    }());
    ;
    var SkipEvent = /** @class */ (function (_super) {
        __extends(SkipEvent, _super);
        function SkipEvent(device) {
            var _this = _super.call(this) || this;
            _this.device = device;
            _this.eventType = EventType.Skip;
            return _this;
        }
        SkipEvent.prototype.swap = function () {
        };
        return SkipEvent;
    }(Event));
    ;
    var SendEvent = /** @class */ (function (_super) {
        __extends(SendEvent, _super);
        function SendEvent(device, port, state, rts, message, cancelled) {
            var _this = _super.call(this) || this;
            _this.device = device;
            _this.port = port;
            _this.state = state;
            _this.rts = rts;
            _this.message = message;
            _this.cancelled = cancelled;
            _this.eventType = EventType.Send;
            return _this;
        }
        SendEvent.prototype.swap = function () {
            types_1.assert(!this.applied);
            var tmp1 = this.device.state;
            this.device.state = this.state;
            this.state = tmp1;
            var tmp2 = this.device.rts;
            this.device.rts = this.rts;
            this.rts = tmp2;
        };
        return SendEvent;
    }(Event));
    ;
    var InitEvent = /** @class */ (function (_super) {
        __extends(InitEvent, _super);
        function InitEvent(device, state, rts, message) {
            var _this = _super.call(this) || this;
            _this.device = device;
            _this.state = state;
            _this.rts = rts;
            _this.message = message;
            _this.eventType = EventType.Init;
            return _this;
        }
        InitEvent.prototype.swap = function () {
            types_1.assert(!this.applied);
            var tmp1 = this.device.state;
            this.device.state = this.state;
            this.state = tmp1;
            var tmp2 = this.device.rts;
            this.device.rts = this.rts;
            this.rts = tmp2;
        };
        return InitEvent;
    }(Event));
    ;
    var ReceiveEvent = /** @class */ (function (_super) {
        __extends(ReceiveEvent, _super);
        function ReceiveEvent(edge, state, rts, message) {
            var _this = _super.call(this) || this;
            _this.edge = edge;
            _this.state = state;
            _this.rts = rts;
            _this.message = message;
            _this.eventType = EventType.Receive;
            return _this;
        }
        ReceiveEvent.prototype.swap = function () {
            types_1.assert(!this.applied);
            var tmp1 = this.edge.dstDev.state;
            this.edge.dstDev.state = this.state;
            this.state = tmp1;
            var tmp2 = this.edge.dstDev.rts;
            this.edge.dstDev.rts = this.rts;
            this.rts = tmp2;
        };
        return ReceiveEvent;
    }(Event));
    ;
    function get_event_list_updated_nodes_and_edges(events) {
        var devices = {};
        var edges = {};
        for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
            var ev = events_1[_i];
            if (ev instanceof InitEvent) {
                devices[ev.device.id] = ev.device;
            }
            else if (ev instanceof SendEvent) {
                devices[ev.device.id] = ev.device;
                for (var _a = 0, _b = ev.device.outputs[ev.port.name]; _a < _b.length; _a++) {
                    var e_1 = _b[_a];
                    edges[e_1.id] = e_1;
                    devices[e_1.dstDev.id] = e_1.dstDev;
                }
            }
            else if (ev instanceof ReceiveEvent) {
                devices[ev.edge.srcDev.id] = ev.edge.srcDev;
                devices[ev.edge.dstDev.id] = ev.edge.dstDev;
                edges[ev.edge.id] = ev.edge;
            }
            else {
                types_1.assert(false);
            }
        }
        var aDevices = [];
        var aEdges = [];
        for (var d in devices) {
            aDevices.push(devices[d]);
        }
        for (var e in edges) {
            aEdges.push(edges[e]);
        }
        return [aDevices, aEdges];
    }
    exports.get_event_list_updated_nodes_and_edges = get_event_list_updated_nodes_and_edges;
    var SingleStepper = /** @class */ (function () {
        function SingleStepper() {
            this.readyDevs = [];
            this.readyEdges = [];
            this.history = [];
            this.g = null;
        }
        SingleStepper.prototype.attach = function (graph, doInit) {
            types_1.assert(this.g == null);
            this.g = graph;
            for (var _i = 0, _a = this.g.enumDevices(); _i < _a.length; _i++) {
                var d = _a[_i];
                if (doInit && ("__init__" in d.deviceType.inputs)) {
                    var port = d.deviceType.inputs["__init__"];
                    var message = port.edgeType.message.create();
                    var preState = d.deviceType.state.import(d.state);
                    var preRts = d.rts;
                    d.rts = port.onReceive(this.g.properties, d.properties, d.state, port.edgeType.properties.create(), port.edgeType.state.create(), message);
                    this.history.push(new InitEvent(d, preState, preRts, message));
                }
                this.update_dev(d);
            }
            for (var _b = 0, _c = this.g.enumEdges(); _b < _c.length; _b++) {
                var e = _c[_b];
                this.update_edge(e);
            }
        };
        SingleStepper.prototype.detach = function () {
            types_1.assert(this.g != null);
            var res = this.g;
            this.history = [];
            this.readyDevs = [];
            this.readyEdges = [];
            this.g = null;
            return res;
        };
        SingleStepper.prototype.update_dev = function (dev) {
            dev.update();
            var ii = this.readyDevs.indexOf(dev);
            if (!dev.is_rts() || dev.blocked()) {
                if (ii != -1) {
                    this.readyDevs.splice(ii, 1);
                }
            }
            else {
                if (ii == -1) {
                    this.readyDevs.push(dev);
                }
            }
        };
        SingleStepper.prototype.update_edge = function (edge) {
            edge.update();
            var ii = this.readyEdges.indexOf(edge);
            if (edge.empty()) {
                if (ii != -1) {
                    this.readyEdges.splice(ii, 1);
                }
            }
            else {
                if (ii == -1) {
                    this.readyEdges.push(edge);
                }
            }
        };
        SingleStepper.prototype.step = function () {
            var _a;
            var res = [];
            var readyAll = this.readyEdges.length + this.readyDevs.length;
            //console.log(`readyEdges : ${this.readyEdges.length}, readyDevs : ${this.readyDevs.length}`);
            if (readyAll == 0)
                return [0, res];
            var sel = Math.floor(Math.random() * readyAll);
            if (sel < this.readyDevs.length) {
                var selDev = sel;
                var dev = this.readyDevs[selDev];
                if (dev.rate != 1.0 && dev.rate < Math.random()) {
                    res.push(new SkipEvent(dev));
                    return [1, res];
                }
                this.readyDevs.splice(selDev, 1);
                types_1.assert(dev.is_rts());
                var rtsPorts = [];
                {
                    var rtsBits = dev.rts;
                    var rtsIndex = 0;
                    while (rtsBits) {
                        if (rtsBits & 1) {
                            rtsPorts.push(rtsIndex);
                        }
                        rtsBits >>= 1;
                        rtsIndex++;
                    }
                }
                types_1.assert(rtsPorts.length > 0);
                var selPort = Math.floor(Math.random() * rtsPorts.length);
                var port = dev.deviceType.getOutputByIndex(rtsPorts[selPort]);
                var message = port.edgeType.message.create();
                var preState = dev.deviceType.state.import(dev.state);
                var preRts = dev.rts;
                var doSend;
                _a = port.onSend(this.g.properties, dev.properties, dev.state, message), doSend = _a[0], dev.rts = _a[1];
                res.push(new SendEvent(dev, port, preState, preRts, message, !doSend));
                //console.log(` send to ${dev.id} : state'=${JSON.stringify(dev.state)}, rts'=${JSON.stringify(dev.rts)}`);
                if (doSend) {
                    for (var _i = 0, _b = dev.outputs[port.name]; _i < _b.length; _i++) {
                        var e = _b[_i];
                        e.queue.push(message);
                        this.update_edge(e);
                    }
                }
                this.update_dev(dev);
            }
            else {
                var selEdge = sel - this.readyDevs.length;
                var e = this.readyEdges[selEdge];
                this.readyEdges.splice(selEdge, 1);
                var message = e.queue[0];
                e.queue.splice(0, 1);
                var preState = e.dstDev.deviceType.state.import(e.dstDev.state);
                var preRts = e.dstDev.rts;
                e.dstDev.rts = e.dstPort.onReceive(this.g.properties, e.dstDev.properties, e.dstDev.state, e.properties, e.state, message);
                res.push(new ReceiveEvent(e, preState, preRts, message));
                //console.log(`   eprops = ${JSON.stringify(e.properties)}`);
                //console.log(`   recv on ${e.dstDev.id} : state'=${JSON.stringify(e.dstDev.state)}, rts'=${JSON.stringify(e.dstDev.rts)}`);
                this.update_dev(e.dstDev);
                this.update_dev(e.srcDev);
            }
            this.history = this.history.concat(res);
            return [res.length, res];
        };
        return SingleStepper;
    }());
    exports.SingleStepper = SingleStepper;
    var BatchStepper = /** @class */ (function () {
        function BatchStepper() {
            this.g = null;
            this.rts = [];
            this.history = [];
        }
        BatchStepper.prototype.attach = function (graph, doInit) {
            types_1.assert(this.g == null);
            this.g = graph;
            for (var _i = 0, _a = this.g.enumDevices(); _i < _a.length; _i++) {
                var d = _a[_i];
                if (doInit && ("__init__" in d.deviceType.inputs)) {
                    var port = d.deviceType.inputs["__init__"];
                    var message = port.edgeType.message.create();
                    d.rts = port.onReceive(this.g.properties, d.properties, d.state, port.edgeType.properties.create(), port.edgeType.state.create(), message);
                }
                d.update();
            }
            for (var _b = 0, _c = this.g.enumEdges(); _b < _c.length; _b++) {
                var e = _c[_b];
                while (e.queue.length > 0) {
                    var h = e.queue.pop();
                    var message = h;
                    e.queue.splice(0, 1);
                    e.dstDev.rts = e.dstPort.onReceive(this.g.properties, e.dstDev.properties, e.dstDev.state, e.properties, e.state, message);
                }
                e.update();
                e.srcDev.update();
                e.dstDev.update();
            }
            for (var _d = 0, _e = graph.enumDevices(); _d < _e.length; _d++) {
                var d = _e[_d];
                if (d.is_rts()) {
                    this.rts.push(d);
                }
            }
        };
        BatchStepper.prototype.detach = function () {
            types_1.assert(this.g != null);
            var res = this.g;
            this.g = null;
            this.rts = [];
            return res;
        };
        BatchStepper.prototype.step = function () {
            var _a;
            var count = 0;
            var rtsDevNext = [];
            var rtsDevCurr = this.rts;
            for (var _i = 0, rtsDevCurr_1 = rtsDevCurr; _i < rtsDevCurr_1.length; _i++) {
                var dev = rtsDevCurr_1[_i];
                if (!dev.is_rts())
                    continue; // Shouldn't happen
                if (dev.rate != 1.0 && dev.rate < Math.random()) {
                    ++count;
                    rtsDevNext.push(dev);
                    continue;
                }
                var port;
                var deviceType = dev.deviceType;
                if (deviceType.outputCount == 1) {
                    port = deviceType.outputsByIndex[0];
                }
                else {
                    var rtsPorts = [];
                    {
                        var rtsBits = dev.rts;
                        var rtsIndex = 0;
                        while (rtsBits) {
                            if (rtsBits & 1) {
                                rtsPorts.push(rtsIndex);
                            }
                            rtsBits >>= 1;
                            rtsIndex++;
                        }
                    }
                    types_1.assert(rtsPorts.length > 0);
                    var selPort = Math.floor(Math.random() * rtsPorts.length);
                    port = dev.deviceType.getOutputByIndex(rtsPorts[selPort]);
                }
                var message = port.edgeType.message.create();
                var doSend;
                _a = port.onSend(this.g.properties, dev.properties, dev.state, message), doSend = _a[0], dev.rts = _a[1];
                if (dev.rts) {
                    rtsDevNext.push(dev);
                }
                dev.update_rts_only();
                ++count;
                if (doSend) {
                    //let outgoing=dev.outputs[port.name];
                    var outgoing = dev.outputsByIndex[port.index];
                    for (var _b = 0, outgoing_1 = outgoing; _b < outgoing_1.length; _b++) {
                        var e = outgoing_1[_b];
                        var dstDev = e.dstDev;
                        var preRts = dstDev.rts;
                        dstDev.rts = e.dstPort.onReceive(this.g.properties, dstDev.properties, dstDev.state, e.properties, e.state, message);
                        if (dstDev.rts && !preRts) {
                            rtsDevNext.push(dstDev);
                        }
                        dstDev.update_rts_only();
                        ++count;
                    }
                }
            }
            this.rts = rtsDevNext;
            return [count, []];
        };
        return BatchStepper;
    }());
    exports.BatchStepper = BatchStepper;
});
//# sourceMappingURL=simulators.js.map