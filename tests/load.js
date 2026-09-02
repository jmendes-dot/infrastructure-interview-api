import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    steady_load: {
      executor: "constant-vus",
      vus: 20,
      duration: "30s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<250"],
  },
};

const baseUrl = __ENV.BASE_URL || "http://127.0.0.1:8080";

export default function () {
  const response = http.get(`${baseUrl}/posts?limit=25`);
  check(response, { "status is 200": (result) => result.status === 200 });
  sleep(0.2);
}
