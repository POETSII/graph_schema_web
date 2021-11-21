define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var StatePanel = /** @class */ (function () {
        function StatePanel(container) {
            this.container = container;
            this._table = null;
            this._propMapping = [];
            this._stateMapping = [];
            this._rate = null;
            this._currentDevice = null;
        }
        StatePanel.prototype.makeCell = function (msg) {
            var res = new HTMLTableRowElement();
            res.innerText = msg;
            return res;
        };
        StatePanel.prototype.addHeaderRow = function () {
            var res = document.createElement("tr");
            var p1 = document.createElement("th");
            p1.innerText = "Name";
            var p2 = document.createElement("th");
            p2.innerText = "Value";
            res.appendChild(p1);
            res.appendChild(p2);
            this._table.appendChild(res);
        };
        StatePanel.prototype.addRateRow = function () {
            var res = document.createElement("tr");
            var p1 = document.createElement("td");
            p1.innerText = "rate";
            var p2 = document.createElement("td");
            var p3 = document.createElement("textarea");
            p2.appendChild(p3);
            res.appendChild(p1);
            res.appendChild(p2);
            this._table.appendChild(res);
            this._rate = p3;
            var device = this._currentDevice;
            this._rate.onchange = function () {
                var val = p3.value;
                var r = parseFloat(val);
                if (r < 0)
                    r = 0;
                if (r > 1)
                    r = 1;
                device.rate = r;
            };
        };
        StatePanel.prototype.addDataRow = function (type, isProp) {
            var res = document.createElement("tr");
            var p1 = document.createElement("td");
            p1.innerText = type.name;
            var p2 = document.createElement("td");
            var p3 = document.createElement("span");
            p2.appendChild(p3);
            res.appendChild(p1);
            res.appendChild(p2);
            this._table.appendChild(res);
            if (isProp) {
                this._propMapping.push([type, p3]);
            }
            else {
                this._stateMapping.push([type, p3]);
            }
        };
        StatePanel.prototype.detach = function () {
            this._propMapping = [];
            this._stateMapping = [];
            this._currentDevice = null;
            this._table = null;
            this.container.innerHTML = ""; // Delete existing table?
        };
        StatePanel.prototype.attach = function (device) {
            this.detach();
            if (device == null)
                return;
            this._currentDevice = device;
            this._table = document.createElement("table");
            this.addHeaderRow();
            this.addRateRow();
            for (var _i = 0, _a = device.properties._spec_.elementsByIndex; _i < _a.length; _i++) {
                var elt = _a[_i];
                this.addDataRow(elt, true);
            }
            for (var _b = 0, _c = device.state._spec_.elementsByIndex; _b < _c.length; _b++) {
                var elt = _c[_b];
                this.addDataRow(elt, false);
            }
            this.container.appendChild(this._table);
            this._rate.innerText = this._currentDevice.rate.toFixed(3);
            this.update();
        };
        StatePanel.prototype.update = function () {
            if (!this._currentDevice)
                return;
            for (var _i = 0, _a = this._propMapping; _i < _a.length; _i++) {
                var _b = _a[_i], type = _b[0], span = _b[1];
                var val = this._currentDevice.properties[type.name];
                span.innerText = type.format(val);
            }
            for (var _c = 0, _d = this._stateMapping; _c < _d.length; _c++) {
                var _e = _d[_c], type = _e[0], span = _e[1];
                var val = this._currentDevice.state[type.name];
                span.innerText = type.format(val);
            }
        };
        return StatePanel;
    }());
    exports.StatePanel = StatePanel;
    ;
});
//# sourceMappingURL=state_panel.js.map