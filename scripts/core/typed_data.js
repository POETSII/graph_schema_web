define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TypedData = /** @class */ (function () {
        function TypedData(_name_, _spec_) {
            this._name_ = _name_;
            this._spec_ = _spec_;
        }
        TypedData.prototype.equals = function (other) { return this._spec_.equals(this, other); };
        TypedData.prototype.clone = function () { return this._spec_.clone(this); };
        return TypedData;
    }());
    exports.TypedData = TypedData;
    ;
    var EmptyTypedData = /** @class */ (function () {
        function EmptyTypedData(_spec_) {
            this._spec_ = _spec_;
            this._name_ = "empty";
        }
        EmptyTypedData.prototype.clone = function () {
            return new EmptyTypedData(this._spec_);
        };
        EmptyTypedData.prototype.equals = function (other) {
            if (other instanceof EmptyTypedData) {
                return true;
            }
            else {
                throw "Attempt to compare incompatible typed data instances";
            }
        };
        return EmptyTypedData;
    }());
    ;
    var ScalarDataType = /** @class */ (function () {
        function ScalarDataType(name, type, defaultValue) {
            if (defaultValue === void 0) { defaultValue = 0; }
            this.name = name;
            this.type = type;
            this.defaultValue = defaultValue;
            this.is_composite = false;
        }
        ScalarDataType.prototype.format = function (data) {
            if (this.type == "float") {
                return Number(data).toFixed(3);
            }
            else if (this.type == "int") {
                return Number(data).toString();
            }
            else if (this.type == "boolean") {
                return data ? "true" : "false";
            }
            else {
                throw "Invalid data type";
            }
        };
        return ScalarDataType;
    }());
    exports.ScalarDataType = ScalarDataType;
    function tFloat(name, defaultValue) {
        if (defaultValue === void 0) { defaultValue = 0.0; }
        return new ScalarDataType(name, "float", defaultValue);
    }
    exports.tFloat = tFloat;
    function tInt(name, defaultValue) {
        if (defaultValue === void 0) { defaultValue = 0.0; }
        return new ScalarDataType(name, "int", defaultValue);
    }
    exports.tInt = tInt;
    function tBoolean(name, defaultValue) {
        if (defaultValue === void 0) { defaultValue = false; }
        return new ScalarDataType(name, "boolean", defaultValue);
    }
    exports.tBoolean = tBoolean;
    var VectorDataType = /** @class */ (function () {
        function VectorDataType(name, elementType, elementCount) {
            this.name = name;
            this.elementType = elementType;
            this.elementCount = elementCount;
            this.is_composite = true;
        }
        VectorDataType.prototype.format = function (data) {
            var res = "[";
            if (data instanceof Array) {
                var et = this.elementType;
                var first = true;
                for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                    var e = data_1[_i];
                    if (first) {
                        first = false;
                    }
                    else {
                        res = res + "," + et.format(e);
                    }
                }
            }
            else {
                throw "Data is not an array";
            }
            res = res + "]";
            return res;
        };
        return VectorDataType;
    }());
    exports.VectorDataType = VectorDataType;
    var TupleDataType = /** @class */ (function () {
        function TupleDataType(name, elementsByIndex) {
            this.name = name;
            this.elementsByIndex = elementsByIndex;
            this.is_composite = true;
            this.elements = {};
            for (var _i = 0, elementsByIndex_1 = elementsByIndex; _i < elementsByIndex_1.length; _i++) {
                var e = elementsByIndex_1[_i];
                if (e.name in this.elements) {
                    throw "Duplicate tuple element name";
                }
                this.elements[e.name] = e;
            }
        }
        TupleDataType.prototype.format = function (data) {
            var res = "{";
            var first = true;
            for (var _i = 0, _a = this.elementsByIndex; _i < _a.length; _i++) {
                var et = _a[_i];
                var v = data[et.name];
                if (first) {
                    first = false;
                }
                else {
                    res = res + ",";
                }
                res = res + et.name + ":" + et.format(v);
            }
            res = res + "}";
            return res;
        };
        return TupleDataType;
    }());
    exports.TupleDataType = TupleDataType;
    var EmptyTypedDataSpec = /** @class */ (function () {
        function EmptyTypedDataSpec(name) {
            if (name === void 0) { name = "empty"; }
            this.name = name;
            this.is_composite = true;
            this.elements = {};
            this.elementsByIndex = [];
            this._shared = new EmptyTypedData(this);
        }
        EmptyTypedDataSpec.prototype.clone = function (x) { return this._shared; };
        EmptyTypedDataSpec.prototype.equals = function (a, b) {
            if ((a instanceof EmptyTypedData) && (b instanceof EmptyTypedData)) {
                return true;
            }
            else {
                throw "Cannot compare data from different specs.";
            }
        };
        EmptyTypedDataSpec.prototype.create = function () {
            return this._shared;
        };
        EmptyTypedDataSpec.prototype.import = function (data) {
            for (var n in data) {
                throw "Unexpected property";
            }
            return this._shared;
        };
        EmptyTypedDataSpec.prototype.format = function (data) {
            return "{}";
        };
        return EmptyTypedDataSpec;
    }());
    exports.EmptyTypedDataSpec = EmptyTypedDataSpec;
    function clone_typed_data(orig) {
        var spec = orig._spec_;
        var res = orig._spec_.create();
        for (var _i = 0, _a = spec.elementsByIndex; _i < _a.length; _i++) {
            var e = _a[_i];
            if (e instanceof ScalarDataType) {
                res[e.name] = orig[e.name];
            }
            else {
                throw "NotImplemented";
            }
        }
        return res;
    }
    function equals_typed_data(a, b) {
        var spec = a._spec_;
        if (spec != b._spec_) {
            throw "Typed data comes from different specs";
        }
        for (var _i = 0, _a = spec.elementsByIndex; _i < _a.length; _i++) {
            var e = _a[_i];
            if (e instanceof ScalarDataType) {
                if (a[e.name] != b[e.name]) {
                    return false;
                }
            }
            else {
                throw "NotImplemented";
            }
        }
        return true;
    }
    function import_typed_data(spec, data) {
        var res = spec.create();
        if (data != null) {
            for (var _i = 0, _a = spec.elementsByIndex; _i < _a.length; _i++) {
                var e = _a[_i];
                if (data.hasOwnProperty(e.name)) {
                    res[e.name] = data[e.name];
                }
                else if (e instanceof ScalarDataType) {
                    res[e.name] = e.defaultValue;
                }
                else {
                    throw "NotImplemented";
                }
            }
        }
        return res;
    }
    var GenericTypedDataSpec = /** @class */ (function () {
        function GenericTypedDataSpec(
        // https://github.com/Microsoft/TypeScript/issues/2794
        newT, elementsByIndex) {
            this.newT = newT;
            this.elementsByIndex = elementsByIndex;
            this.is_composite = true;
            this.elements = {};
            this.name = new newT(this)._name_;
            for (var _i = 0, elementsByIndex_2 = elementsByIndex; _i < elementsByIndex_2.length; _i++) {
                var e = elementsByIndex_2[_i];
                if (e.name in this.elements) {
                    throw "Duplicate tuple element name";
                }
                this.elements[e.name] = e;
            }
        }
        ;
        GenericTypedDataSpec.prototype.create = function () {
            return new this.newT(this);
        };
        ;
        GenericTypedDataSpec.prototype.equals = function (a, b) {
            return equals_typed_data(a, b);
        };
        // This will work for both another typed data instance, or a general object
        GenericTypedDataSpec.prototype.import = function (data) {
            return import_typed_data(this, data);
        };
        GenericTypedDataSpec.prototype.clone = function (x) { return clone_typed_data(x); };
        GenericTypedDataSpec.prototype.format = function (data) {
            var res = "{";
            var first = true;
            for (var _i = 0, _a = this.elementsByIndex; _i < _a.length; _i++) {
                var et = _a[_i];
                var v = data[et.name];
                if (first) {
                    first = false;
                }
                else {
                    res = res + ",";
                }
                res = res + et.name + ":" + et.format(v);
            }
            res = res + "}";
            return res;
        };
        return GenericTypedDataSpec;
    }());
    exports.GenericTypedDataSpec = GenericTypedDataSpec;
    ;
});
/*
class GenericTypedDataSpec<T extends TypedData>
{
    constructor()

    create() : TypedData
    {
        return this._shared;
    }

    import(data:any) : TypedData
    {
        for(let n in data){
            throw "Unexpected property";
        }
        return this._shared;
    }

    format(data:any) : string
    {
        return "{}";
    }
}*/
//# sourceMappingURL=typed_data.js.map