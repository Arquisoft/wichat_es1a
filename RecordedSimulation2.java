
import java.time.Duration;
import java.util.*;

import io.gatling.javaapi.core.*;
import io.gatling.javaapi.http.*;
import io.gatling.javaapi.jdbc.*;

import static io.gatling.javaapi.core.CoreDsl.*;
import static io.gatling.javaapi.http.HttpDsl.*;
import static io.gatling.javaapi.jdbc.JdbcDsl.*;

public class RecordedSimulation extends Simulation {

  private HttpProtocolBuilder httpProtocol = http
    .baseUrl("http://localhost:8000")
    .inferHtmlResources()
    .acceptHeader("application/json, text/plain, */*")
    .acceptEncodingHeader("gzip, deflate")
    .acceptLanguageHeader("es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3")
    .userAgentHeader("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0");
  
  private Map<CharSequence, String> headers_0 = Map.ofEntries(
    Map.entry("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"),
    Map.entry("If-None-Match", "\"322144c5fc632cef7663b38129ebb9cd0e5f648a\""),
    Map.entry("Priority", "u=1"),
    Map.entry("Upgrade-Insecure-Requests", "1")
  );
  
  private Map<CharSequence, String> headers_1 = Map.ofEntries(
    Map.entry("Accept", "*/*"),
    Map.entry("If-None-Match", "\"c0da17e217801e8bda095b47932a7212f9ace2c1\"")
  );
  
  private Map<CharSequence, String> headers_2 = Map.ofEntries(
    Map.entry("Accept", "text/css,*/*;q=0.1"),
    Map.entry("If-None-Match", "\"0bbf4c6ed2f36a9cedd776f1ccc42da565b4d4df\""),
    Map.entry("Priority", "u=2")
  );
  
  private Map<CharSequence, String> headers_3 = Map.ofEntries(
    Map.entry("Accept", "image/avif,image/webp,*/*"),
    Map.entry("If-None-Match", "\"22741d9a4ab30daf380dd05fde26e88146b3c983\""),
    Map.entry("Priority", "u=4")
  );
  
  private Map<CharSequence, String> headers_4 = Map.ofEntries(
    Map.entry("Accept", "image/avif,image/webp,*/*"),
    Map.entry("If-None-Match", "\"3a8b9a29db60f6c2f1e0fc9bc6bc89549bf5cb5f\""),
    Map.entry("Priority", "u=4")
  );
  
  private Map<CharSequence, String> headers_5 = Map.ofEntries(
    Map.entry("Accept", "*/*"),
    Map.entry("Cache-Control", "no-cache"),
    Map.entry("Content-Type", "application/ocsp-request"),
    Map.entry("Pragma", "no-cache"),
    Map.entry("Priority", "u=4")
  );
  
  private Map<CharSequence, String> headers_7 = Map.ofEntries(
    Map.entry("Accept", "image/avif,image/webp,*/*"),
    Map.entry("If-None-Match", "\"fa6b4a8d885adea2b79164a3477cf96117cd5aae\""),
    Map.entry("Priority", "u=1")
  );
  
  private Map<CharSequence, String> headers_9 = Map.ofEntries(
    Map.entry("If-None-Match", "W/\"483-J4v443HbjYzTgKHC/9//4rb1CB8\""),
    Map.entry("Origin", "http://localhost:3000"),
    Map.entry("Priority", "u=1")
  );
  
  private Map<CharSequence, String> headers_10 = Map.ofEntries(
    Map.entry("Accept", "*/*"),
    Map.entry("Access-Control-Request-Headers", "content-type"),
    Map.entry("Access-Control-Request-Method", "POST"),
    Map.entry("Origin", "http://localhost:3000"),
    Map.entry("Priority", "u=4")
  );
  
  private Map<CharSequence, String> headers_11 = Map.ofEntries(
    Map.entry("Content-Type", "application/json"),
    Map.entry("Origin", "http://localhost:3000")
  );
  
  private Map<CharSequence, String> headers_12 = Map.ofEntries(
    Map.entry("Accept", "image/avif,image/webp,*/*"),
    Map.entry("Priority", "u=4")
  );
  
  private Map<CharSequence, String> headers_13 = Map.ofEntries(
    Map.entry("If-None-Match", "W/\"46d-TnoFhz1ZneaeJsbe3P2tSTbrQug\""),
    Map.entry("Origin", "http://localhost:3000")
  );
  
  private Map<CharSequence, String> headers_17 = Map.ofEntries(
    Map.entry("If-None-Match", "W/\"53d-zeIgMd5iVURzDxVgov+yYAg8Lr4\""),
    Map.entry("Origin", "http://localhost:3000")
  );
  
  private Map<CharSequence, String> headers_26 = Map.ofEntries(
    Map.entry("Accept", "*/*"),
    Map.entry("Access-Control-Request-Headers", "content-type"),
    Map.entry("Access-Control-Request-Method", "PUT"),
    Map.entry("Origin", "http://localhost:3000"),
    Map.entry("Priority", "u=4")
  );
  
  private Map<CharSequence, String> headers_27 = Map.ofEntries(
    Map.entry("Accept", "audio/webm,audio/ogg,audio/wav,audio/*;q=0.9,application/ogg;q=0.7,video/*;q=0.6,*/*;q=0.5"),
    Map.entry("Accept-Encoding", "identity"),
    Map.entry("If-None-Match", "\"1820880250aa1a1ffce97e0209c19c87f0e88efb\""),
    Map.entry("Priority", "u=4"),
    Map.entry("Range", "bytes=0-")
  );
  
  private Map<CharSequence, String> headers_28 = Map.ofEntries(
    Map.entry("Content-Type", "application/json"),
    Map.entry("Origin", "http://localhost:3000"),
    Map.entry("Priority", "u=1")
  );
  
  private Map<CharSequence, String> headers_32 = Map.ofEntries(
    Map.entry("Accept", "image/avif,image/webp,*/*"),
    Map.entry("If-None-Match", "\"b49098b40e97075465e4f4baf359805dc5836841\""),
    Map.entry("Priority", "u=4")
  );
  
  private String uri1 = "http://r10.o.lencr.org";
  
  private String uri2 = "http://commons.wikimedia.org/wiki/Special:FilePath";
  
  private String uri3 = "localhost";
  
  private String uri4 = "http://r11.o.lencr.org";

  private ScenarioBuilder scn = scenario("RecordedSimulation")
    .exec(
      http("request_0")
        .get("http://" + uri3 + ":3000/pictureGame")
        .headers(headers_0)
        .resources(
          http("request_1")
            .get("http://" + uri3 + ":3000/static/js/main.56d6bf2a.js")
            .headers(headers_1),
          http("request_2")
            .get("http://" + uri3 + ":3000/static/css/main.8d92cc75.css")
            .headers(headers_2),
          http("request_3")
            .get("http://" + uri3 + ":3000/logo_wichat_white.png")
            .headers(headers_3),
          http("request_4")
            .get("http://" + uri3 + ":3000/default_user.jpg")
            .headers(headers_4),
          http("request_5")
            .post(uri1 + "/")
            .headers(headers_5)
            .body(RawFileBody("recordedsimulation/0005_request.dat")),
          http("request_6")
            .post(uri4 + "/")
            .headers(headers_5)
            .body(RawFileBody("recordedsimulation/0006_request.dat")),
          http("request_7")
            .get("http://" + uri3 + ":3000/loading.gif")
            .headers(headers_7),
          http("request_8")
            .get("http://" + uri3 + ":3000/loading.gif")
            .headers(headers_7),
          http("request_9")
            .get("/questions/random/flags/4?username=hola")
            .headers(headers_9),
          http("request_10")
            .options("http://" + uri3 + ":8003/set-image")
            .headers(headers_10),
          http("request_11")
            .post("http://" + uri3 + ":8003/set-image")
            .headers(headers_11)
            .body(RawFileBody("recordedsimulation/0011_request.json")),
          http("request_12")
            .get(uri2 + "/Flag%20of%20Saint%20Lucia.svg")
            .headers(headers_12)
        ),
      pause(3),
      http("request_13")
        .get("/questions/random/flags/4?username=hola")
        .headers(headers_13)
        .resources(
          http("request_14")
            .options("http://" + uri3 + ":8003/set-image")
            .headers(headers_10),
          http("request_15")
            .post("http://" + uri3 + ":8003/set-image")
            .headers(headers_11)
            .body(RawFileBody("recordedsimulation/0015_request.json")),
          http("request_16")
            .get(uri2 + "/Flag%20of%20Tyumen%20Oblast.svg")
            .headers(headers_12)
        ),
      pause(2),
      http("request_17")
        .get("/questions/random/flags/4?username=hola")
        .headers(headers_17)
        .resources(
          http("request_18")
            .post("http://" + uri3 + ":8003/set-image")
            .headers(headers_11)
            .body(RawFileBody("recordedsimulation/0018_request.json")),
          http("request_19")
            .get(uri2 + "/Flag%20of%20Albania.svg")
            .headers(headers_12),
          http("request_20")
            .options("http://" + uri3 + ":8003/set-image")
            .headers(headers_10),
          http("request_21")
            .post("http://" + uri3 + ":8003/set-image")
            .headers(headers_11)
            .body(RawFileBody("recordedsimulation/0021_request.json")),
          http("request_22")
            .get(uri2 + "/Flag%20of%20Japan.svg")
            .headers(headers_12),
          http("request_23")
            .options("http://" + uri3 + ":8003/set-image")
            .headers(headers_10),
          http("request_24")
            .post("http://" + uri3 + ":8003/set-image")
            .headers(headers_11)
            .body(RawFileBody("recordedsimulation/0024_request.json")),
          http("request_25")
            .get(uri2 + "/Flag%20of%20Sint%20Maarten.svg")
            .headers(headers_12),
          http("request_26")
            .options("/statistics")
            .headers(headers_26),
          http("request_27")
            .get("http://" + uri3 + ":3000/sounds/success_sound.mp3")
            .headers(headers_27),
          http("request_28")
            .put("/questionsRecord")
            .headers(headers_28)
            .body(RawFileBody("recordedsimulation/0028_request.json")),
          http("request_29")
            .put("/statistics")
            .headers(headers_28)
            .body(RawFileBody("recordedsimulation/0029_request.json"))
        ),
      pause(2),
      http("request_30")
        .put("/questionsRecord")
        .headers(headers_11)
        .body(RawFileBody("recordedsimulation/0030_request.json"))
        .resources(
          http("request_31")
            .put("/statistics")
            .headers(headers_11)
            .body(RawFileBody("recordedsimulation/0031_request.json"))
        ),
      pause(1),
      http("request_32")
        .get("http://" + uri3 + ":3000/homePage/fotos.jpg")
        .headers(headers_32)
        .resources(
          http("request_33")
            .get("http://" + uri3 + ":3000/homePage/fotos.jpg")
            .headers(headers_32)
        )
    );

  {
	  setUp(scn.injectOpen(rampUsers(100000).during(30),
    		constantUsersPerSec(30000).during(60),
   		rampUsers(200000).during(30))).protocols(httpProtocol);
    //aqui peta por la memoria de la maquina virtual
  }
}
