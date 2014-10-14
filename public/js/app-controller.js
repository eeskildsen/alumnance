angular.module('alumnance')
	.controller('AppController', ['$scope', 'Auth', function($scope, Auth) {
			$scope.auth = Auth;
	}]);