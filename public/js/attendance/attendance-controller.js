'use strict';

angular.module('alumnance')
  .controller('AttendanceController', ['$scope', '$modal', 'resolvedAttendance', 'Attendance',
    function ($scope, $modal, resolvedAttendance, Attendance) {

      $scope.attendances = resolvedAttendance;

      $scope.create = function () {
        $scope.clear();
        $scope.open();
      };

      $scope.update = function (id) {
        $scope.attendance = Attendance.get({id: id});
        $scope.open(id);
      };

      $scope.delete = function (id) {
        Attendance.delete({id: id},
          function () {
            $scope.attendances = Attendance.query();
          });
      };

      $scope.save = function (id) {
        if (id) {
          Attendance.update({id: id}, $scope.attendance,
            function () {
              $scope.attendances = Attendance.query();
              $scope.clear();
            });
        } else {
          Attendance.save($scope.attendance,
            function () {
              $scope.attendances = Attendance.query();
              $scope.clear();
            });
        }
      };

      $scope.clear = function () {
        $scope.attendance = {
          
          "alum_id": "",
          
          "present": "",
          
          "id": ""
        };
      };

      $scope.open = function (id) {
        var attendanceSave = $modal.open({
          templateUrl: 'attendance-save.html',
          controller: AttendanceSaveController,
          resolve: {
            attendance: function () {
              return $scope.attendance;
            }
          }
        });

        attendanceSave.result.then(function (entity) {
          $scope.attendance = entity;
          $scope.save(id);
        });
      };
    }]);

var AttendanceSaveController =
  function ($scope, $modalInstance, attendance) {
    $scope.attendance = attendance;

    

    $scope.ok = function () {
      $modalInstance.close($scope.attendance);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  };
