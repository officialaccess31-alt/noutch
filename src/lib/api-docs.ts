// API page data.
// Backend developer: replace baseUrl and apiKey with the real values, and make the
// endpoint, headers and fields in the examples below match the real API.

export const apiInfo = {
  baseUrl: 'https://api.example.com/v1',
  apiKey: 'replace_with_real_api_key',
}

export type CodeSample = { language: string; code: string }

export function buildSamples(baseUrl: string): CodeSample[] {
  return [
    { language: 'Node.js', code: `const response = await fetch("${baseUrl}/sms", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    sid: "northstar",
    recipients: ["+12025550182"],
    message: "Hello from Noutch",
  }),
})

console.log(await response.json())` },
    { language: 'Python', code: `import requests

response = requests.post(
    "${baseUrl}/sms",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={
        "sid": "northstar",
        "recipients": ["+12025550182"],
        "message": "Hello from Noutch",
    },
)

print(response.json())` },
    { language: 'Ruby', code: `require "net/http"
require "json"

uri = URI("${baseUrl}/sms")
request = Net::HTTP::Post.new(uri)
request["Authorization"] = "Bearer YOUR_API_KEY"
request["Content-Type"] = "application/json"
request.body = {
  sid: "northstar",
  recipients: ["+12025550182"],
  message: "Hello from Noutch"
}.to_json

response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
  http.request(request)
end
puts response.body` },
    { language: 'PHP', code: `<?php
$payload = json_encode([
    "sid" => "northstar",
    "recipients" => ["+12025550182"],
    "message" => "Hello from Noutch",
]);

$curl = curl_init("${baseUrl}/sms");
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer YOUR_API_KEY",
        "Content-Type: application/json",
    ],
    CURLOPT_POSTFIELDS => $payload,
]);

echo curl_exec($curl);
curl_close($curl);` },
    { language: 'Go', code: `package main

import (
  "bytes"
  "fmt"
  "net/http"
)

func main() {
  body := []byte("{\\\"sid\\\":\\\"northstar\\\",\\\"recipients\\\":[\\\"+12025550182\\\"],\\\"message\\\":\\\"Hello from Noutch\\\"}")
  req, _ := http.NewRequest("POST", "${baseUrl}/sms", bytes.NewBuffer(body))
  req.Header.Set("Authorization", "Bearer YOUR_API_KEY")
  req.Header.Set("Content-Type", "application/json")

  res, err := http.DefaultClient.Do(req)
  if err != nil { panic(err) }
  defer res.Body.Close()
  fmt.Println(res.Status)
}` },
    { language: 'Rust', code: `use reqwest::Client;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let response = Client::new()
        .post("${baseUrl}/sms")
        .bearer_auth("YOUR_API_KEY")
        .json(&json!({
            "sid": "northstar",
            "recipients": ["+12025550182"],
            "message": "Hello from Noutch"
        }))
        .send()
        .await?;

    println!("{}", response.text().await?);
    Ok(())
}` },
    { language: 'Java', code: `var client = java.net.http.HttpClient.newHttpClient();
var body = """
    {"sid":"northstar","recipients":["+12025550182"],"message":"Hello from Noutch"}
    """;

var request = java.net.http.HttpRequest.newBuilder()
    .uri(java.net.URI.create("${baseUrl}/sms"))
    .header("Authorization", "Bearer YOUR_API_KEY")
    .header("Content-Type", "application/json")
    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(body))
    .build();

var response = client.send(request,
    java.net.http.HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());` },
    { language: 'cURL', code: `curl -X POST "${baseUrl}/sms" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"sid":"northstar","recipients":["+12025550182"],"message":"Hello from Noutch"}'` },
  ]
}
