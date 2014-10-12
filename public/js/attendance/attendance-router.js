'use strict';

angular.module('alumnance')
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/attendances', {
        templateUrl: 'views/attendance/attendances.html',
        controller: 'AttendanceController',
        resolve:{
          resolvedAttendance: ['Attendance', function (Attendance) {
            return Attendance.query();
          }]
        }
      })
    }]);
