define([
    'dojo',
    'dojo/_base/declare',
    'epi/_Module',
    'epi/dependency',
    'epi/routes'
], function (
    dojo,
    declare,
    _Module,
    dependency,
    routes
) {
    return declare('hotspots/ModuleInitializer', [_Module], {

        initialize: function () {

            this.inherited(arguments);
            var registry = this.resolveDependency('epi.storeregistry');

        },

        _getRestPath: function (name) {

            return routes.getRestPath({ moduleArea: 'Geta.Optimizely.HotspotsEditor', storeName: name });
        }
    });
});