angular.module('alumnance')
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/report', {
				templateUrl: 'alumnance/report',
				resolve: { auth: ['Auth', function(Auth) { return Auth.doRouteAuthentication(); }] }
			});
	}]);