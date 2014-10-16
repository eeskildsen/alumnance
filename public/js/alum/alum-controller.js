'use strict';

angular.module('alumnance')
  .controller('AlumController', ['$scope', '$modal', '$http', 'resolvedAlum', 'resolvedSchools', 'Alum',
    function ($scope, $modal, $http, resolvedAlum, resolvedSchools, Alum) {
	
      $scope.alums = resolvedAlum;
	  
	  $scope.pagination = { current: 1 };

      $scope.create = function () {
        $scope.clear();
        $scope.open();
      };

      $scope.update = function (id) {
        $scope.alum = Alum.get({id: id});
        $scope.open(id);
      };
	  
	  $scope.updateAttendance = function(alum) {
		Alum.update({id: alum.id}, alum);
	  };

      $scope.delete = function (id) {
        Alum.delete({id: id},
          function () {
            $scope.alums = Alum.query();
          });
      };

      $scope.save = function (id) {
        if (id) {
          Alum.update({id: id}, $scope.alum,
            function () {
              $scope.alums = Alum.query();
              $scope.clear();
            });
        } else {
          Alum.save($scope.alum,
            function () {
			  $scope.alums = Alum.query();
              $scope.clear();
            });
        }
      };

      $scope.clear = function () {
        $scope.alum = {
          
          "name": "",
          
          "maiden_name": "",
          
          "class_of": "",
          
          "id": "",
		  
		  "schools": []
        };
      };

      $scope.open = function (id) {
	  
	    // Open the modal
        var alumSave = $modal.open({
          templateUrl: 'alum-save.html',
          controller: 'AlumSaveController',
          resolve: {
            alum: function () {
              return $scope.alum;
            },
			resolvedSchools: function() { return resolvedSchools; }
          }
        });

		// Save the results
        alumSave.result.then(function (entity) {
          $scope.alum = entity;
          $scope.save(id);
        });
      };
    }])
	.controller('AlumSaveController', ['$scope', '$modalInstance', 'alum', 'resolvedSchools',
		function ($scope, $modalInstance, alum, resolvedSchools) {
		$scope.alum = alum;
		$scope.resolvedSchools = resolvedSchools;
		
		// Find out which schools this alum belongs to
		if ($scope.alum.$promise) {
			$scope.alum.$promise.then(function() {
				var schoolNames = $scope.alum.schools.split(", ");
				$scope.alum.schoolIds = [];
				angular.forEach(resolvedSchools, function(school) {
					var index = schoolNames.indexOf(school.name);
					if (index > -1) {
						$scope.alum.schoolIds.push(school.id);
					}
				});
			});
		}
		
		$scope.schoolIndex = function(id) {
			if (typeof $scope.alum.schoolIds !== 'undefined') {
				for (var i = 0; i < $scope.alum.schoolIds.length; i++) {
					if ($scope.alum.schoolIds[i] === id) {
						return i;
					}
				}
			}
			return -1;
		}

		$scope.toggleSchool = function(school) {
			var schoolIndex = $scope.schoolIndex(school.id);
			if (schoolIndex > -1) {
				$scope.alum.schoolIds.splice(schoolIndex, 1);
			} else {
				$scope.alum.schoolIds.push(school.id);
			}
		}

		$scope.ok = function () {
		  $modalInstance.close($scope.alum);
		};

		$scope.cancel = function () {
		  $modalInstance.dismiss('cancel');
		};
	  }
	]);