<?php
class Controller
{
  protected $model = null;
  protected $action = '';
  protected $method = '';
  protected $data = [];
  public function __construct()
  {
    $params = [];
    parse_str($_SERVER['QUERY_STRING'], $params);
    list($this->model, $this->action) = explode('/', $params['api']);
    $this->method = $_SERVER['REQUEST_METHOD'];
    $this->handleData();
  }
  private function handleData()
  {
    $contentType = isset ($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';
    $data = null;
    switch ($this->method) {
      case 'GET':
        $data = $_GET;
        break;
      case 'POST':
        if (strpos($contentType, 'multipart/form-data') !== false) {
          $data = $_POST;
          $data['files'] = $_FILES;
        }
      case 'PUT':
      case 'DELETE':
        if (strpos($contentType, 'application/x-www-form-urlencoded') !== false) {
          $data = file_get_contents('php://input');
          parse_str($data, $data);
        }
        if (strpos($contentType, 'application/json') !== false) {
          $data = file_get_contents('php://input');
          $data = json_decode($data, true);
        }
        break;
      default:
        throw new Error('Unsportted request method!');
    }
    $this->data = $data;
  }
  public function dispatch()
  {
    try {
      $model = new $this->model();
      $action = $this->action;
      if($model!=='User' && $action!=='login' && $action !== 'signUp'){
        $model->authenticate();
      }
      $data = $model->{$action}($this->data);
      echo json_encode([
        'code' => 0,
        'data' => $data,
        'message' => "Success!"
      ]);
    } catch (Exception $e) {
      echo json_encode([
        'code' => 1,
        'message' => $e->getMessage()
      ]);
    }
  }
  public function __call($name, $arguments)
  {
    $this->sendOutput('', array('HTTP/1.1 404 Not Found'));
  }
}