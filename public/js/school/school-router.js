'use strict';

angular.module('alumnance')
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/schools', {
        templateUrl: 'views/school/schools.html',
        controller: 'SchoolController',
        resolve:{
          resolvedSchool: ['School', function (School) {
            return School.query();
          }]
        }
      })
    }]);
