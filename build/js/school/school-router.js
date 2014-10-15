'use strict';

angular.module('alumnance')
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/schools', {
        templateUrl: 'views/school/schools.html',
        controller: 'SchoolController',
        resolve:{
		  auth: ['Auth', function(Auth) { return Auth.doRouteAuthentication(); }],
          resolvedSchool: ['School', function (School) {
            return School.query();
          }]
        }
      })
    }]);
