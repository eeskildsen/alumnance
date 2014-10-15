'use strict';

angular.module('alumnance')
  .controller('SchoolController', ['$scope', '$modal', 'resolvedSchool', 'School',
    function ($scope, $modal, resolvedSchool, School) {

      $scope.schools = resolvedSchool;

      $scope.create = function () {
        $scope.clear();
        $scope.open();
      };

      $scope.update = function (id) {
        $scope.school = School.get({id: id});
        $scope.open(id);
      };

      $scope.delete = function (id) {
        School.delete({id: id},
          function () {
            $scope.schools = School.query();
          });
      };

      $scope.save = function (id) {
        if (id) {
          School.update({id: id}, $scope.school,
            function () {
              $scope.schools = School.query();
              $scope.clear();
            });
        } else {
          School.save($scope.school,
            function () {
              $scope.schools = School.query();
              $scope.clear();
            });
        }
      };

      $scope.clear = function () {
        $scope.school = {
          
          "name": "",
          
          "id": ""
        };
      };

      $scope.open = function (id) {
        var schoolSave = $modal.open({
          templateUrl: 'school-save.html',
          controller: SchoolSaveController,
          resolve: {
            school: function () {
              return $scope.school;
            }
          }
        });

        schoolSave.result.then(function (entity) {
          $scope.school = entity;
          $scope.save(id);
        });
      };
    }]);

var SchoolSaveController =
  function ($scope, $modalInstance, school) {
    $scope.school = school;

    

    $scope.ok = function () {
      $modalInstance.close($scope.school);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  };
