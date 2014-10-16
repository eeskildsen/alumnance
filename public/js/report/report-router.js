angular.module('alumnance')
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/report', {
				templateUrl: 'alumnance/report',
				controller: 'ReportController',
				resolve: { auth: ['Auth', function(Auth) { return Auth.doRouteAuthentication(); }] }
			});
	}]);