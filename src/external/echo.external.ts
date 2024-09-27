// libreria a usar: https://openapi-ts.dev/openapi-fetch/
// Consume el openapi.json del echo server, para actualizar correr `npm run external:gen`
// Habria que ver tema de urls y eso

import createClient from "openapi-fetch";
import type { paths } from "./defs/echo.js"; // generated by openapi-typescript

export const echo = createClient<paths>({ baseUrl: "http://localhost:3000/" });

echo.use({
  onResponse: async ({ response }) => {
    if (!response.ok) {
      const body = await response.json();
      return new Response(
        JSON.stringify({
          type: "echo-service",
          title: body.title,
          status: body.status,
          detail: body.detail,
          errors: body.errors,
        }),
        { status: response.status, headers: response.headers, statusText: response.statusText }
      );
    }
  },
});
