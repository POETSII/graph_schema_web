/// <reference path="../../../node_modules/@types/xmldom/index.d.ts" />
define(["require", "exports", "./types", "./instances"], function (require, exports, types_1, instances_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ;
    function find_single(elt, tag, ns) {
        var src = elt.getElementsByTagNameNS(ns, tag);
        if (src.length > 1) {
            throw "No graph element";
        }
        if (src.length == 0) {
            return null;
        }
        for (var e in src) {
            return src[e];
        }
    }
    function get_attribute_required(elt, name) {
        if (!elt.hasAttribute(name)) {
            throw "Missing attribute " + name;
        }
        return elt.getAttribute(name);
    }
    function get_attribute_optional(elt, name) {
        if (!elt.hasAttribute(name)) {
            return null;
        }
        return elt.getAttribute(name);
    }
    function import_json(spec, value) {
        if (!value) {
            return spec.create();
        }
        var json = JSON.parse("{" + value + "}");
        return spec.import(json);
    }
    function split_path(path) {
        var endpoints = path.split("-");
        if (endpoints.length != 2)
            throw "Path did not split into two components";
        var _a = endpoints[0].split(":"), dstDevId = _a[0], dstPortName = _a[1];
        var _b = endpoints[1].split(":"), srcDevId = _b[0], srcPortName = _b[1];
        return [dstDevId, dstPortName, srcDevId, srcPortName];
    }
    function loadGraphXmlToEvents(registry, parent, events) {
        var _a;
        var ns = "http://TODO.org/POETS/virtual-graph-schema-v1";
        var eGraph = find_single(parent, "GraphInstance", ns);
        if (!eGraph)
            throw "No graph element.";
        var graphId = get_attribute_required(eGraph, "id");
        var graphTypeId = get_attribute_required(eGraph, "graphTypeId");
        var graphType = lookupGraphType(graphTypeId, registry);
        for (var et in graphType.edgeTypes) {
            events.onEdgeType(graphType.edgeTypes[et]);
        }
        for (var dt_1 in graphType.deviceTypes) {
            events.onDeviceType(graphType.deviceTypes[dt_1]);
        }
        events.onGraphType(graphType);
        var graphProperties;
        var eProperties = find_single(eGraph, "Properties", ns);
        if (eProperties) {
            graphProperties = import_json(graphType.properties, eProperties.textContent);
        }
        else {
            graphProperties = graphType.properties.create();
        }
        var gId = events.onBeginGraphInstance(graphType, graphId, graphProperties);
        var devices = {};
        var eDeviceInstances = find_single(eGraph, "DeviceInstances", ns);
        if (!eDeviceInstances)
            throw "No DeviceInstances element";
        events.onBeginDeviceInstances(gId);
        var devIs = eDeviceInstances.getElementsByTagNameNS(ns, "DevI");
        for (var i = 0; i < devIs.length; i++) {
            var eDevice = devIs[i];
            var id = get_attribute_required(eDevice, "id");
            var deviceTypeId = get_attribute_required(eDevice, "type");
            var dt = graphType.deviceTypes[deviceTypeId];
            if (!dt) {
                throw "Couldn't find a device type called " + deviceTypeId;
            }
            var deviceProperties;
            var eProperties_1 = find_single(eDevice, "P", ns);
            if (eProperties_1) {
                deviceProperties = import_json(dt.properties, eProperties_1.textContent);
            }
            else {
                deviceProperties = dt.properties.create();
            }
            var metadata = {};
            var eMetadata = find_single(eDevice, "M", ns);
            if (eMetadata) {
                var value = eMetadata.textContent;
                metadata = JSON.parse("{" + value + "}");
            }
            console.log("  Adding device " + id + ", metadata=" + metadata);
            var dId = events.onDeviceInstance(gId, dt, id, deviceProperties, metadata);
            devices[id] = [dId, dt];
        }
        events.onEndDeviceInstances(gId);
        events.onBeginEdgeInstances(gId);
        var eEdgeInstances = find_single(eGraph, "EdgeInstances", ns);
        if (!eEdgeInstances)
            throw "No EdgeInstances element";
        var edgeIs = eEdgeInstances.getElementsByTagNameNS(ns, "EdgeI");
        for (var i = 0; i < edgeIs.length; i++) {
            var eEdge = edgeIs[i];
            var srcDeviceId, srcPortName, dstDeviceId, dstPortName;
            var path = get_attribute_optional(eEdge, "path");
            if (path) {
                _a = split_path(path), dstDeviceId = _a[0], dstPortName = _a[1], srcDeviceId = _a[2], srcPortName = _a[3];
            }
            else {
                srcDeviceId = get_attribute_required(eEdge, "srcDeviceId");
                srcPortName = get_attribute_required(eEdge, "srcPortName");
                dstDeviceId = get_attribute_required(eEdge, "dstDeviceId");
                dstPortName = get_attribute_required(eEdge, "dstPortName");
            }
            var srcDevice = devices[srcDeviceId];
            var dstDevice = devices[dstDeviceId];
            var srcPort = srcDevice[1].getOutput(srcPortName);
            var dstPort = dstDevice[1].getInput(dstPortName);
            if (srcPort.edgeType != dstPort.edgeType)
                throw "Edge type mismatch on ports.";
            var et = srcPort.edgeType;
            var edgeProperties = null;
            eProperties = find_single(eEdge, "P", ns);
            if (eProperties) {
                edgeProperties = import_json(et.properties, eProperties.textContent);
            }
            else {
                edgeProperties = et.properties.create();
            }
            events.onEdgeInstance(gId, dstDevice[0], dstDevice[1], dstPort, srcDevice[0], srcDevice[1], srcPort, edgeProperties, metadata);
        }
        events.onBeginEdgeInstances(gId);
        events.onEndGraphInstance(gId);
    }
    exports.loadGraphXmlToEvents = loadGraphXmlToEvents;
    var GraphBuilder = /** @class */ (function () {
        function GraphBuilder() {
            this.g = null;
        }
        GraphBuilder.prototype.onDeviceType = function (deviceType) {
            // noop
        };
        GraphBuilder.prototype.onEdgeType = function (edgeType) {
            // noop
        };
        GraphBuilder.prototype.onGraphType = function (graphType) {
            // noop
        };
        //! Indicates the graph is starting. Returns a token representing the graph
        GraphBuilder.prototype.onBeginGraphInstance = function (graphType, id, properties) {
            types_1.assert(this.g == null);
            this.g = new instances_1.GraphInstance(graphType, id, properties);
            return this.g;
        };
        //! The graph is now complete
        GraphBuilder.prototype.onEndGraphInstance = function (graphToken) {
            types_1.assert(this.g == graphToken);
        };
        //! The device instances within the graph instance will follow
        GraphBuilder.prototype.onBeginDeviceInstances = function (graphToken) {
            // noop
        };
        //! There will be no more device instances in the graph.
        GraphBuilder.prototype.onEndDeviceInstances = function (graphToken) {
            // noop
        };
        // Tells the consumer that a new instance is being added
        /*! The return value is a unique token that means something
             to the consumer. */
        GraphBuilder.prototype.onDeviceInstance = function (graphToken, dt, id, properties, metadata) {
            types_1.assert(graphToken == this.g);
            return this.g.addDevice(id, dt, properties, metadata);
        };
        //! The edge instances within the graph instance will follow
        GraphBuilder.prototype.onBeginEdgeInstances = function (graphToken) {
            // noop
        };
        //! There will be no more edge instances in the graph.
        GraphBuilder.prototype.onEndEdgeInstances = function (graphToken) {
            // noop
        };
        //! Tells the consumer that the a new edge is being added
        /*! It is required that both device instances have already been
            added (otherwise the ids would not been known).
        */
        GraphBuilder.prototype.onEdgeInstance = function (graphToken, dstDevToken, dstDevType, dstPort, srcDevToken, srcDevType, srcPort, properties, metadata) {
            types_1.assert(graphToken == this.g);
            this.g.addEdgeRaw(dstDevToken, dstPort, srcDevToken, srcPort, properties, metadata);
        };
        return GraphBuilder;
    }());
    exports.GraphBuilder = GraphBuilder;
    function loadGraphFromUrl(url, registry) {
        //    var jQuery=require('jquery');
        if (registry === void 0) { registry = null; }
        // TODO : This should be asynchronous with a cancel GUI callback
        // http://stackoverflow.com/a/2592780
        var content;
        jQuery.ajax({
            url: url,
            success: function (data) {
                content = data;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                throw "Couldn't load data from " + url + " : " + errorThrown;
            },
            async: false
        });
        return loadGraphFromXml(content, registry);
    }
    exports.loadGraphFromUrl = loadGraphFromUrl;
    // http://stackoverflow.com/a/31090240
    var isNodeCheck = new Function("try {return this===global;}catch(e){return false;}");
    var isNode = isNodeCheck();
    function loadGraphFromString(data, registry) {
        if (registry === void 0) { registry = null; }
        var parser;
        if (isNode) {
            var xmldom = require("xmldom");
            parser = new xmldom.DOMParser();
        }
        else {
            parser = new DOMParser();
        }
        console.log("Parsing xml");
        var doc = parser.parseFromString(data, "application/xml");
        console.log("Looking for graphs");
        var graphs = doc.getElementsByTagName("Graphs");
        for (var _i = 0, graphs_1 = graphs; _i < graphs_1.length; _i++) {
            var elt = graphs_1[_i];
            var builder = new GraphBuilder();
            console.log("Begin loadGraph");
            loadGraphXmlToEvents(registry, elt, builder);
            console.log("End loadGraph");
            return builder.g;
        }
        throw "No graph instance found in text";
    }
    exports.loadGraphFromString = loadGraphFromString;
    function loadGraphFromXml(data, registry) {
        if (registry === void 0) { registry = null; }
        var graphs = data.getElementsByTagName("Graphs");
        for (var i = 0; i < graphs.length; i++) {
            var elt = graphs[i];
            var builder = new GraphBuilder();
            console.log("Begin loadGraph");
            loadGraphXmlToEvents(registry, elt, builder);
            console.log("End loadGraph");
            return builder.g;
        }
        throw "No graph instance found in text";
    }
    exports.loadGraphFromXml = loadGraphFromXml;
    var DefaultRegistry = /** @class */ (function () {
        function DefaultRegistry() {
            this._mapping = {};
        }
        DefaultRegistry.prototype.registerGraphType = function (graphType) {
            this._mapping[graphType.id] = graphType;
        };
        DefaultRegistry.prototype.lookupGraphType = function (id) {
            return this._mapping[id];
        };
        return DefaultRegistry;
    }());
    exports.DefaultRegistry = DefaultRegistry;
    ;
    var defaultRegistry = new DefaultRegistry();
    function registerGraphType(graphType) {
        return defaultRegistry.registerGraphType(graphType);
    }
    exports.registerGraphType = registerGraphType;
    function lookupGraphType(id, registry) {
        if (registry === void 0) { registry = null; }
        if (!registry)
            registry = defaultRegistry;
        var res = registry.lookupGraphType(id);
        if (!res)
            throw "lookupGraphType(" + id + ") - No known graph type with that id.";
        return res;
    }
    exports.lookupGraphType = lookupGraphType;
});
//# sourceMappingURL=loader.js.map