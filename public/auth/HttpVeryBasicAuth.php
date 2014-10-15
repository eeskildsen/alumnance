<?php

/**
 * Middleware for providing basic HTTP authentication on Slim routes.
 * @author Eric Eskildsen
 * @author Ian C. (9bitstudios.com)
 */
class HttpVeryBasicAuth extends \Slim\Middleware {

    /**
     * @var string
     */
    protected $realm;
	
	/**
	 * @var string
	 */
	protected $username;
	
	/**
	 * @var string
	 */
	protected $password;

    /**
     * Constructor
     *
	 * @param   string  $username   The username to match authentication requests against.
	 * @param   string  $realm      The password to match authentication requests against.
     * @param   string  $realm      The HTTP Authentication realm
     */
    public function __construct($username, $password, $realm = 'Alumnance') {
		$this->username = $username;
		$this->password = $password;
        $this->realm = $realm;
    }

    /**
     * Deny Access
     *
     */
    public function deny_access() {
        $res = $this->app->response();
        $res->status(401);
        $res->header('WWW-Authenticate', sprintf('Basic realm="%s"', $this->realm));
    }

    /**
     * Authenticate 
     *
     * @param   string  $username   The HTTP Authentication username
     * @param   string  $password   The HTTP Authentication password     
     *
     */
    public function authenticate($username, $password) {
        return ((isset($username) && strtolower($username) === $this->username) && (isset($password) && $password === $this->password));
    }

    /**
     * Call
     *
     * This method will check the HTTP request headers for previous authentication. If
     * the request has already authenticated, the next middleware is called. Otherwise,
     * a 401 Authentication Required response is returned to the client.
     */
    public function call() {
        $req = $this->app->request();
        $res = $this->app->response();
		
		$path = strtolower($this->app->request->getResourceUri());
        if ($path !== '/' && $path !== '/alumnance/login') {
            $authUser = $req->headers('PHP_AUTH_USER');
            $authPass = $req->headers('PHP_AUTH_PW');

            if ($this->authenticate($authUser, $authPass)) {
                $this->next->call();
            } else {
                $this->deny_access();
            }
        } else {
            $this->next->call();
        }
    }

}
