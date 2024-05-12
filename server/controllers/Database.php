<?php
class Database
{
  protected $mysqli = null;
  protected $userId = null;
  private $hashMethod = 'sha256';
  private $secretKey = 'assignment02';
  public function __construct()
  {
    $this->connect();
  }
  public function connect()
  {
    $this->mysqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT);
    if ($this->mysqli->connect_errno) {
      throw new Exception("Connection failed:" . $this->mysqli->connect_error);
    }
  }
  public function execute($query, $params = [])
  {
    $stmt = $this->executeStmt($query, $params);
    $result = $stmt->get_result();
    if($result){
      $data = $result->fetch_all(MYSQLI_ASSOC);
      $result->close();
    } else {
      $data = $stmt->affected_rows;
    }
    $stmt->close();
    return $data;

  }
  private function executeStmt($query, $params = [])
  {
    $stmt = $this->mysqli->prepare($query);
    if (!$stmt) {
      throw new Exception("Invalid query: " . $query);
    }
    if(count($params) > 0) {
      $stmt->bind_param(...$params);
    }
    if (!$stmt->execute()) {
      throw new Exception("Fail to execute the statement: " . $stmt->error);
    }
    return $stmt;
  }
  public function close()
  {
    $this->mysqli->close();
  }
  public function generateToken($payload)
  {
    $token = [
      'id' => $payload['id'],
      'token' => hash_hmac($this->hashMethod, json_encode($payload), $this->secretKey),
      'expr' => time() + 24 * 60 * 60
    ];
    return base64_encode(json_encode($token));
  }
  public function authenticate()
  {
    try {
      $auth = $_SERVER['HTTP_AUTHORIZATION'];
      $token = str_replace('Bearer ', '', $auth);
      if(!$token) {
        throw new Exception('No authentication token detected. Please log in or authenticate to access this feature.');
      }
      list('id'=>$id, 'token'=>$token, 'expr'=>$expr) = json_decode(base64_decode($token),true);
      // check if there is a authorized user
      $user = $this->execute("SELECT * FROM Users WHERE id = ?", ['i', $id]);
      if (count($user) != 1) {
        throw new Exception('Unauthorized User!');
      }
      $user = $user[0];
      // check if the token is valid
      $userToken = hash_hmac($this->hashMethod, json_encode($user), $this->secretKey);
      if (!hash_equals($token, $userToken)) {
        throw new Exception('Invalid Token!');
      }
      // check if the token is expired
      if (time() > $expr) {
        throw new Exception('Login Expired!');
      }
      $this->userId = $user['id'];
    } catch (Exception $e) {
      // Set the 401 Unauthorized status code
      // header('HTTP/1.1 401 Unauthorized');
      http_response_code(401);
      // return "debugger";
      // Optionally, provide a message in the response body
      die("Unauthorized - {$e->getMessage()}");
    }
  }
}