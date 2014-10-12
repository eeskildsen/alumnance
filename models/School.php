<?php

class School extends Illuminate\Database\Eloquent\Model {

    protected $table = "schools";
    public $timestamps = false;
    
    public function getIdAttribute($value)
	{
		return (integer) $value;
	}
    
    
}
