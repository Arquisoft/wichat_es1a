
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
    .acceptHeader("image/avif,image/webp,*/*")
    .acceptEncodingHeader("gzip, deflate")
    .acceptLanguageHeader("es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3")
    .userAgentHeader("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0");
  
  private Map<CharSequence, String> headers_0 = Map.ofEntries(
    Map.entry("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"),
    Map.entry("Priority", "u=1"),
    Map.entry("Upgrade-Insecure-Requests", "1")
  );
  
  private Map<CharSequence, String> headers_1 = Map.of("Priority", "u=4");
  
  private Map<CharSequence, String> headers_4 = Map.ofEntries(
    Map.entry("If-None-Match", "\"22741d9a4ab30daf380dd05fde26e88146b3c983\""),
    Map.entry("Priority", "u=4")
  );
  
  private Map<CharSequence, String> headers_5 = Map.ofEntries(
    Map.entry("If-None-Match", "\"600939a6506e2f92554e6fc97b1b779e5329c4f5\""),
    Map.entry("Priority", "u=4")
  );
  
  private Map<CharSequence, String> headers_6 = Map.ofEntries(
    Map.entry("If-None-Match", "\"3a8b9a29db60f6c2f1e0fc9bc6bc89549bf5cb5f\""),
    Map.entry("Priority", "u=4")
  );
  
  private Map<CharSequence, String> headers_7 = Map.of("Priority", "u=6");
  
  private Map<CharSequence, String> headers_8 = Map.ofEntries(
    Map.entry("Accept", "video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5"),
    Map.entry("Accept-Encoding", "identity"),
    Map.entry("Priority", "u=4"),
    Map.entry("Range", "bytes=0-")
  );
  
  private Map<CharSequence, String> headers_12 = Map.ofEntries(
    Map.entry("Accept", "*/*"),
    Map.entry("Access-Control-Request-Headers", "content-type"),
    Map.entry("Access-Control-Request-Method", "POST"),
    Map.entry("Origin", "http://localhost:3000"),
    Map.entry("Priority", "u=4")
  );
  
  private Map<CharSequence, String> headers_13 = Map.ofEntries(
    Map.entry("Accept", "application/json, text/plain, */*"),
    Map.entry("Content-Type", "application/json"),
    Map.entry("Origin", "http://localhost:3000"),
    Map.entry("Priority", "u=1")
  );
  
  private Map<CharSequence, String> headers_19 = Map.ofEntries(
    Map.entry("Accept", "application/json, text/plain, */*"),
    Map.entry("Content-Type", "application/json"),
    Map.entry("Origin", "http://localhost:3000")
  );
  
  private Map<CharSequence, String> headers_25 = Map.of("Priority", "u=1");
  
  private Map<CharSequence, String> headers_26 = Map.ofEntries(
    Map.entry("If-None-Match", "\"fa6b4a8d885adea2b79164a3477cf96117cd5aae\""),
    Map.entry("Priority", "u=1")
  );
  
  private Map<CharSequence, String> headers_27 = Map.ofEntries(
    Map.entry("Accept", "application/json, text/plain, */*"),
    Map.entry("Origin", "http://localhost:3000"),
    Map.entry("Priority", "u=1")
  );
  
  private Map<CharSequence, String> headers_31 = Map.ofEntries(
    Map.entry("Accept", "application/json, text/plain, */*"),
    Map.entry("If-None-Match", "W/\"4ab-S97tGxLoVkC82XcvcJBYlXv6yQ8\""),
    Map.entry("Origin", "http://localhost:3000")
  );
  
  private Map<CharSequence, String> headers_35 = Map.ofEntries(
    Map.entry("Accept", "application/json, text/plain, */*"),
    Map.entry("If-None-Match", "W/\"3f9-0bbp59LxIYLnbMkmkpSANd2ZQFw\""),
    Map.entry("Origin", "http://localhost:3000")
  );
  
  private String uri1 = "http://commons.wikimedia.org/wiki/Special:FilePath";
  
  private String uri2 = "localhost";

  private ScenarioBuilder scn = scenario("RecordedSimulation")
    .exec(
      http("request_0")
        .get("http://" + uri2 + ":3000/")
        .headers(headers_0)
        .resources(
          http("request_1")
            .get("http://" + uri2 + ":3000/logo_wichat_white.png")
            .headers(headers_1),
          http("request_2")
            .get("http://" + uri2 + ":3000/default_user.jpg")
            .headers(headers_1),
          http("request_3")
            .get("http://" + uri2 + ":3000/home/logo_wichat.png")
            .headers(headers_1),
          http("request_4")
            .get("http://" + uri2 + ":3000/logo_wichat_white.png")
            .headers(headers_4),
          http("request_5")
            .get("http://" + uri2 + ":3000/home/logo_wichat.png")
            .headers(headers_5),
          http("request_6")
            .get("http://" + uri2 + ":3000/default_user.jpg")
            .headers(headers_6),
          http("request_7")
            .get("http://" + uri2 + ":3000/logo192.png")
            .headers(headers_7),
          http("request_8")
            .get("http://" + uri2 + ":3000/home/Background-White.webm")
            .headers(headers_8)
        ),
      pause(12),
      http("request_9")
        .get("http://" + uri2 + ":3000/login")
        .headers(headers_0)
        .resources(
          http("request_10")
            .get("http://" + uri2 + ":3000/logo_wichat_white.png")
            .headers(headers_4),
          http("request_11")
            .get("http://" + uri2 + ":3000/default_user.jpg")
            .headers(headers_6)
        ),
      pause(19),
      http("request_12")
        .options("/user")
        .headers(headers_12)
        .resources(
          http("request_13")
            .post("/user")
            .headers(headers_13)
            .body(RawFileBody("recordedsimulation/0013_request.json"))
            .check(status().is(400))
        ),
      pause(17),
      http("request_14")
        .options("/user")
        .headers(headers_12)
        .resources(
          http("request_15")
            .post("/user")
            .headers(headers_13)
            .body(RawFileBody("recordedsimulation/0015_request.json"))
            .check(status().is(400))
        ),
      pause(12),
      http("request_16")
        .options("/user")
        .headers(headers_12)
        .resources(
          http("request_17")
            .post("/user")
            .headers(headers_13)
            .body(RawFileBody("recordedsimulation/0017_request.json")),
          http("request_18")
            .options("/login")
            .headers(headers_12),
          http("request_19")
            .post("/login")
            .headers(headers_19)
            .body(RawFileBody("recordedsimulation/0019_request.json")),
          http("request_20")
            .get("http://" + uri2 + ":3000/bertinIcon.jpg")
            .headers(headers_1),
          http("request_21")
            .get("http://" + uri2 + ":3000/homePage/fotos.jpg")
            .headers(headers_1)
        ),
      pause(3),
      http("request_22")
        .get("http://" + uri2 + ":3000/pictureGame")
        .headers(headers_0)
        .resources(
          http("request_23")
            .get("http://" + uri2 + ":3000/logo_wichat_white.png")
            .headers(headers_4),
          http("request_24")
            .get("http://" + uri2 + ":3000/default_user.jpg")
            .headers(headers_6)
        ),
      pause(2),
      http("request_25")
        .get("http://" + uri2 + ":3000/loading.gif")
        .headers(headers_25)
        .resources(
          http("request_26")
            .get("http://" + uri2 + ":3000/loading.gif")
            .headers(headers_26),
          http("request_27")
            .get("/questions/random/flags/4?username=hola")
            .headers(headers_27),
          http("request_28")
            .options("http://" + uri2 + ":8003/set-image")
            .headers(headers_12),
          http("request_29")
            .post("http://" + uri2 + ":8003/set-image")
            .headers(headers_19)
            .body(RawFileBody("recordedsimulation/0029_request.json")),
          http("request_30")
            .get(uri1 + "/Flag%20of%20Egypt.svg")
            .headers(headers_1)
        ),
      pause(3),
      http("request_31")
        .get("/questions/random/flags/4?username=hola")
        .headers(headers_31)
        .resources(
          http("request_32")
            .options("http://" + uri2 + ":8003/set-image")
            .headers(headers_12),
          http("request_33")
            .post("http://" + uri2 + ":8003/set-image")
            .headers(headers_19)
            .body(RawFileBody("recordedsimulation/0033_request.json")),
          http("request_34")
            .get(uri1 + "/Flag%20of%20Kiribati.svg")
            .headers(headers_1)
        ),
      pause(3),
      http("request_35")
        .get("/questions/random/flags/4?username=hola")
        .headers(headers_35)
        .resources(
          http("request_36")
            .options("http://" + uri2 + ":8003/set-image")
            .headers(headers_12),
          http("request_37")
            .post("http://" + uri2 + ":8003/set-image")
            .headers(headers_19)
            .body(RawFileBody("recordedsimulation/0037_request.json")),
          http("request_38")
            .get(uri1 + "/Flag%20of%20Djibouti.svg")
            .headers(headers_1)
            .check(status().is(301))
        )
    );

  {
	  setUp(scn.injectOpen(rampUsers(100000).during(5))).protocols(httpProtocol);
  }
}
