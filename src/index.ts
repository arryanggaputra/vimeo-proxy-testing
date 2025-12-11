import { Hono } from "hono";
import { proxy } from "hono/proxy";

const app = new Hono();

interface VimeoApiResponse {
  success: boolean;
  data: { url: string };
}

async function fetchVimeoUrlFromApi(
  vimeoVideoId: string,
  apiBaseUrl: string
): Promise<string> {
  const fetchUrl = `${apiBaseUrl}/api/v2/vimeo/video-url/${vimeoVideoId}`;
  console.log("Fetching from API URL:", fetchUrl);
  const apiResponse = await fetch(fetchUrl, {
    method: "GET",
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
    },
  });

  if (!apiResponse.ok) {
    throw new Error("Failed to fetch video URL from API");
  }

  const apiData = (await apiResponse.json()) as VimeoApiResponse;

  if (!apiData.success || !apiData.data?.url) {
    throw new Error("Invalid API response");
  }

  return apiData.data.url;
}

async function resolveRedirectUrl(videoUrl: string): Promise<string> {
  try {
    // First, try to get the redirect with manual mode
    const response = await fetch(videoUrl, {
      method: "HEAD",
      redirect: "manual",
    });

    // Check if it's a redirect
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location) {
        console.log("Redirect found via Location header:", location);
        return location;
      }
    }

    // If manual redirect didn't work, try following redirects
    const followResponse = await fetch(videoUrl, {
      method: "HEAD",
      redirect: "follow",
    });

    const actualVideoUrl = followResponse.url;
    console.log("Original URL:", videoUrl);
    console.log("Final URL:", actualVideoUrl);

    if (!actualVideoUrl || actualVideoUrl === videoUrl) {
      throw new Error("Failed to resolve video URL - no redirect detected");
    }

    return actualVideoUrl;
  } catch (error) {
    console.error("Error in resolveRedirectUrl:", error);
    // If redirect resolution fails, return the original URL and let proxy handle it
    console.log("Falling back to original URL");
    return videoUrl;
  }
}

app.get("/:vimeoVideoId", async (c) => {
  const { vimeoVideoId } = c.req.param();

  if (!vimeoVideoId) {
    return c.json({ error: "Vimeo video ID is required" }, 400);
  }

  try {
    if (!process.env.API_BASE_URL) {
      return c.json({ error: "API_BASE_URL is not configured" }, 500);
    }

    const videoUrl = await fetchVimeoUrlFromApi(
      vimeoVideoId,
      process.env.API_BASE_URL
    );

    console.log("Video URL from API:", videoUrl);
    return proxy(videoUrl);
  } catch (error) {
    console.error("Error:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

export default {
  fetch: app.fetch,
  port: process.env.PORT || 3000,
};
