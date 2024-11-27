#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include "DHT.h"

// WiFi credentials
const char* ssid = "your-ssid";
const char* password = "your-password";
const int port = 9926; // Define the port for Prometheus

ESP8266WebServer server(port);

// Define the pins
int sensorPin = A0; // Soil moisture sensor
const int lightSensorPin = A1; // Light sensor

#define DHTPIN 2     // Define the pin where the data pin of the DHT11 is connected
#define DHTTYPE DHT11   // Define the type of DHT sensor (DHT11)
DHT dht(DHTPIN, DHTTYPE);

int sensorValue = 0;
float humidity = 0.0;
float temperature = 0.0;
int lightSensorValue = 0;

void setup() {
  // Initialize serial communication at 9600 baud rate
  Serial.begin(9600);
  dht.begin();

  // Set WiFi mode to client
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("Connected to WiFi");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  // Setup HTTP server
  server.on("/", HandleRoot);
  server.on("/metrics", HandleRoot);
  server.onNotFound(HandleNotFound);
  
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  // Read sensors
  humidity = dht.readHumidity();    // Read humidity
  temperature = dht.readTemperature(); // Read temperature in Celsius

  // Check if any reads failed
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  sensorValue = analogRead(sensorPin); // Read soil moisture sensor value
  lightSensorValue = analogRead(lightSensorPin); // Read light sensor value

  server.handleClient();
}

String GenerateMetrics() {
  String message = "";

  // Soil Moisture
  message += "# HELP soil_moisture Soil moisture value\n";
  message += "# TYPE soil_moisture gauge\n";
  message += "soil_moisture " + String(sensorValue) + "\n";

  // Temperature
  message += "# HELP temperature Temperature in Celsius\n";
  message += "# TYPE temperature gauge\n";
  message += "temperature " + String(temperature) + "\n";

  // Humidity
  message += "# HELP humidity Humidity in percentage\n";
  message += "# TYPE humidity gauge\n";
  message += "humidity " + String(humidity) + "\n";

  // Light Sensor
  message += "# HELP light_sensor Light sensor value\n";
  message += "# TYPE light_sensor gauge\n";
  message += "light_sensor " + String(lightSensorValue) + "\n";

  return message;
}

void HandleRoot() {
  server.send(200, "text/plain", GenerateMetrics());
}

void HandleNotFound() {
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET) ? "GET" : "POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";
  for (uint i = 0; i < server.args(); i++) {
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  server.send(404, "text/html", message);
}
