var IGNORE_PROPERTIES = ["links", "displayName"];
function EntitiesController(EntitiesRepository, $log, $rootScope, $scope, $state, $location, $stateParams, uiGridConstants) {

    $log = $log.getInstance("EntitiesController(" + JSON.stringify($stateParams) + ")");
    $log.debug("instanceOf() ");

    $scope.$state = $state;
    $scope.entityName = $stateParams.entityName;
    $scope.resources = $rootScope.resources;

    $scope.gridOptions = {
        enableSorting: true,
        enableFullRowSelection: true,
        multiSelect: false
    };

    $scope.gridOptions.onRegisterApi = function (gridApi) {
        $scope.gridApi = gridApi;
        console.log("Registered gridApi");
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
            var selection = gridApi.selection.getSelectedRows();
            if(selection.length > 0) {
                $scope.selectedObject = selection[0];
            } else {
                $scope.selectedObject = null;
            }
            console.log("Selected object: " + JSON.stringify($scope.selectedObject));
        });
    };

    $scope.createNew = function () {
        $state.go("entities.edit", {entity: $scope.entityName});
    };

    $scope.edit = function () {
        if ($scope.selectedObject) {
            console.log("Edit: " + $scope.entityName + " - " + $scope.selectedObject.id);
            $state.go("entities.edit", {entity: $scope.entityName, id: $scope.selectedObject.id});
        }
    };

    var paginationOptions = {
        pageNumber: 1,
        pageSize: 25,
        sort: null
    };


    if ($state.is("entities.list")) {
        EntitiesRepository.loadAll($stateParams.entity, entitiesLoaded);
    } else {
        if ($stateParams.id) {
            EntitiesRepository.find($stateParams.entity, $stateParams.id, entityLoaded);
        } else {
            newEntity();
        }
    }


    function newEntity() {
        prepareEditForm({});
    }

    function entitiesLoaded(entities) {
        console.log("Entites returned: " + JSON.stringify(entities));
        $scope.entities = entities;
        $scope.gridOptions.columnDefs = createColumnDefs($stateParams.entity);
        $scope.gridOptions.data = entities;
    }

    function entityLoaded(entity) {
        console.log("Entity returned: " + JSON.stringify(entity));
        prepareEditForm(entity);
    }

    function createColumnDefs(entityName) {
        var columnDefs = [];
        for (let propertyName in $rootScope.schemata[entityName].properties) {
            var column = {};
            column.name = propertyName;
            if (IGNORE_PROPERTIES.indexOf(entityName) < 0) {
                columnDefs.push(column);
            }
        }
        return columnDefs;
    }

    function prepareEditForm(model) {
        console.log("Schema: " + JSON.stringify($rootScope.schemata[$scope.entity]));
        $scope.schema = $rootScope.schemata[$scope.entity];

        $scope.form = [
            "*",
            {
                type: "submit",
                title: "Save"
            }
        ];

        $scope.model = model;
    }

}


export default [
    'EntitiesRepository', '$log', '$rootScope', '$scope', '$state', '$location', '$stateParams', 'uiGridConstants',
    EntitiesController
];
