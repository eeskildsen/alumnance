<?php
require 'vendor/autoload.php';

/******************************************************************************************
Set up Eloquent ORM
******************************************************************************************/

use Illuminate\Database\Capsule\Manager as Capsule;

$capsule = new Capsule;

$capsule->addConnection([
    'driver'    => 'sqlite',
    'host'      => 'localhost',
    'database'  => implode(DIRECTORY_SEPARATOR, [__DIR__, 'data', 'alumnance.db']),
    'username'  => '',
    'password'  => '',
    'charset'   => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix'    => '',
]);

// Set the event dispatcher used by Eloquent models... (optional)
use Illuminate\Events\Dispatcher;
use Illuminate\Container\Container;
$capsule->setEventDispatcher(new Dispatcher(new Container));

// Make this Capsule instance available globally via static methods... (optional)
$capsule->setAsGlobal();

// Set up the Eloquent ORM... (optional; unless you've used setEventDispatcher())
$capsule->bootEloquent();

// Enable SQLite foreign key support
$capsule->connection()->getPdo()->exec('PRAGMA foreign_keys=ON');

/******************************************************************************************
Set up Slim
******************************************************************************************/

$app = new \Slim\Slim();
$auth = new HttpVeryBasicAuth('demo', 'demo');
$app->add($auth);

/******************************************************************************************
Routes: non-model
******************************************************************************************/

$app->get('/', function() use ($app) {
    readfile('index.html');
    $app->stop();
});

$app->post('/alumnance/login', function() use($app, $auth) {
	$body = $app->request->getBody();
	$json = json_decode($body);
	
	$success = $auth->authenticate(strtolower($json->username), $json->password);
	echo json_encode(['success' => $success]);
});

$app->post('/alumnance/upload', function() use($app) {

	// Make sure that a file was received and that it's really a CSV file
	if (!isset($_FILES['file'])) {
		$app->response->status(500);
		echo json_encode(array('message' => 'The file didn\'t make it to the server.'));
	} elseif (substr(strtolower($_FILES['file']['name']), -3) !== 'csv') {
		$app->response->status(500);
		echo json_encode(array('message' => 'That doesn\'t look like the right type of file. Please upload a CSV file.'));
	} else {
		
		// Make sure the CSV file has the required number of columns
		$rows = file($_FILES['file']['tmp_name']);
		$firstRow = str_getcsv(array_shift($rows));
		if (count($firstRow) < 4) {
			$app->response->status(500);
			echo json_encode(array('message' => 'That file doesn\'t have the right number of columns. Please upload a CSV file with 4 columns.'));
		} else {
			
			$existingSchools = [];
			
			
			// Remove all old alums, schools, and alum-to-school relations
			Capsule::beginTransaction();
			Alum::truncate();
			AlumSchool::truncate();
			School::truncate();
			Capsule::commit();

			Capsule::beginTransaction();
			foreach ($rows as $row) {
				
				// Get the current alum's attributes and schools from this row's CSV fields
				$csv = str_getcsv($row);
				if (strlen($csv[0]) > 0) {
				
					$alum = new Alum;
					$alum->name = $csv[0];
					$alum->maiden_name = $csv[1];
					$alum->class_of = $csv[3];
					$schools = explode(', ', $csv[2]);
					$alum->save();
					
					// Update or create the alum's school(s) in the database
					if (count($schools) > 0) {
						foreach ($schools as $school) {
							if (!array_key_exists($school, $existingSchools)) {
								$newSchool = new School;
								$newSchool->name = $school;
								$newSchool->save();
								$existingSchools[$school] = $newSchool->id;
							}
							$alum->schools()->attach($existingSchools[$school]);
						}
						$alum->save();
						
					}
					
				}
			}
			Capsule::commit();
			
			echo json_encode(array('message' => 'The data file was processed successfully.'));
		}
	}
});

$app->get('/alumnance/report', function() use($app) {
	
	// Get all alums, ordering by year
	$sql = <<<'SQL'
SELECT alums.class_of, alums.name, alums.maiden_name, GROUP_CONCAT(schools.name, ", ") AS schools
FROM alums
LEFT JOIN alum_school ON alum_school.alum_id = alums.id
LEFT JOIN schools ON schools.id = alum_school.school_id
WHERE alums.is_present = 1
GROUP BY alums.id
ORDER BY alums.class_of ASC
SQL;
	$statement = Capsule::connection()->getPdo()->query($sql);
	$rows = $statement->fetchAll(PDO::FETCH_ASSOC|PDO::FETCH_GROUP);
	
	include implode(DIRECTORY_SEPARATOR, [__DIR__, 'views', 'report', 'index.php']);
});

/******************************************************************************************
Routes: School
******************************************************************************************/
 
$app->get('/alumnance/schools', function() {
    $schools = School::orderBy('name')->get();
    echo $schools->toJson();
});

$app->get('/alumnance/schools/:id', function($id) use($app) {
    $school = School::find($id);
    if (is_null($school)) {
        $app->response->status(404);
        $app->stop();
    }
    echo $school->toJson();    
});

$app->post('/alumnance/schools', function() use($app) {
    $body = $app->request->getBody();
    $obj = json_decode($body);
    $school = new School;
    
    $school->name = $obj->{'name'};
    $school->save();
    $app->response->status(201);
    echo $school->toJson();    
});

$app->put('/alumnance/schools/:id', function($id) use($app) {
    $body = $app->request->getBody();
    $obj = json_decode($body);
    $school = School::find($id);
    if (is_null($school)) {
        $app->response->status(404);
        $app->stop();
    }
    
    $school->name = $obj->{'name'};
    $school->save();
    echo $school->toJson();    
});

$app->delete('/alumnance/schools/:id', function($id) use($app) {
    $school = School::find($id);
    if (is_null($school)) {
        $app->response->status(404);
        $app->stop();
    }
    $school->delete();
    $app->response->status(204);
});

/******************************************************************************************
Routes: Alum
******************************************************************************************/

$app->get('/alumnance/alums', function() use($app) {
	$sql = 'SELECT alums.id, alums.is_present, alums.name, alums.maiden_name, alums.class_of, GROUP_CONCAT(schools.name, ", ") AS schools FROM alums LEFT JOIN alum_school ON alum_school.alum_id = alums.id LEFT JOIN schools ON schools.id = alum_school.school_id GROUP BY alums.name ORDER BY alums.name';
	$statement = Capsule::connection()->getPdo()->query($sql);
	$rows = $statement->fetchAll(PDO::FETCH_ASSOC);
	$json = json_encode($rows, JSON_NUMERIC_CHECK);
	echo str_replace('"is_present":1', '"is_present":true', $json);
});

$app->get('/alumnance/alums/:id', function($id) use($app) {

	// Get the alum with the specified ID
	$sql = 'SELECT alums.name, alums.is_present, alums.maiden_name, alums.class_of, GROUP_CONCAT(schools.name, ", ") AS schools FROM alums LEFT JOIN alum_school ON alum_school.alum_id = alums.id LEFT JOIN schools ON schools.id = alum_school.school_id WHERE alums.id = :id GROUP BY alums.name';
	$statement = Capsule::connection()->getPdo()->prepare($sql);
	$statement->bindValue(':id', $id);
	$statement->execute();
	$alum = $statement->fetch(PDO::FETCH_ASSOC);

	// 404 if an alum with the specified ID wasn't found
    if ($alum === false) {
        $app->response->status(404);
        $app->stop();
    }
	
    $json = json_encode($alum, JSON_NUMERIC_CHECK);
	echo str_replace('"is_present":1', '"is_present":true', $json);
});

$app->post('/alumnance/alums', function() use($app) {
    $body = $app->request->getBody();
    $obj = json_decode($body);
    $alum = new Alum;
    
    $alum->name = $obj->name;
	$alum->is_present = (isset($obj->is_present)) ? $obj->is_present : 0;
    $alum->maiden_name = $obj->maiden_name;
    $alum->class_of = (isset($obj->class_of)) ? $obj->class_of : null;
    $alum->save();
	$alum->schools()->attach($obj->schoolIds);
    $app->response->status(201);
    $json = $alum->toJson();    
	echo str_replace('"is_present":1', '"is_present":true', $json);
});

$app->put('/alumnance/alums/:id', function($id) use($app) {
    $body = $app->request->getBody();
    $obj = json_decode($body);
    $alum = Alum::with('schools')->find($id);
    if (is_null($alum)) {
        $app->response->status(404);
        $app->stop();
    }
    
    $alum->name = $obj->{'name'};
	$alum->is_present = (isset($obj->is_present)) ? $obj->is_present : 0;
    $alum->maiden_name = $obj->{'maiden_name'};
	
	// Update which schools this alum attended, unless we're just updating the alum's attendance
	if (isset($obj->schoolIds)) {
		$alum->schools()->sync($obj->schoolIds);
	}
		
    $alum->class_of = $obj->{'class_of'};
    $alum->save();
	$json = $alum->toJson();
    echo str_replace('"is_present":1', '"is_present":true', $json);
});

$app->delete('/alumnance/alums/:id', function($id) use($app) {
    $alum = Alum::find($id);
    if (is_null($alum)) {
        $app->response->status(404);
        $app->stop();
    }
    $alum->delete();
    $app->response->status(204);
});


$app->run();
